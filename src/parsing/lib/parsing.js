// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Please note that the code below is the modified code distributed on the terms, mentioned below.
// The copyright for the changes belongs to YANDEX LLC.
//
// Copyright 2023 YANDEX LLC
//
// Licensed under the Apache License, Version 2.0 (the "License")
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under
// the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific language governing permissions
// and limitations under the License.

// endsWith polyfill from hue_utils.js, needed as workers live in their own js environment
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString, position) {
    const subjectString = this.toString();
    if (
      typeof position !== 'number' ||
      !isFinite(position) ||
      Math.floor(position) !== position ||
      position > subjectString.length
    ) {
      position = subjectString.length;
    }

    position -= searchString.length;
    const lastIndex = subjectString.lastIndexOf(searchString, position);

    return lastIndex !== -1 && lastIndex === position;
  };
}

export function identifierEquals(a, b) {
  return a &&
    b &&
    a.replace(/^\s*`/, '').replace(/`\s*$/, '').toLowerCase() === b.replace(/^\s*`/, '').replace(/`\s*$/, '').toLowerCase();
}

export function equalIgnoreCase(a, b) {
  return a && b && a.toLowerCase() === b.toLowerCase();
}

export const SIMPLE_TABLE_REF_SUGGESTIONS = [
  'suggestJoinConditions',
  'suggestAggregateFunctions',
  'suggestFilters',
  'suggestGroupBys',
  'suggestOrderBys'
];

export const LOCATION_TYPES = {
  ALIAS: 'alias',
  ASTERISK: 'asterisk',
  COLUMN: 'column',
  DATABASE: 'database',
  FILE: 'file',
  FUNCTION: 'function',
  FUNCTION_ARGUMENT: 'functionArgument',
  STATEMENT: 'statement',
  STATEMENT_TYPE: 'statementType',
  TABLE: 'table',
  UNKNOWN: 'unknown',
  VARIABLE: 'variable'
};

const APPEND_BACKTICK_SUGGESTIONS = [
  'suggestColumns',
  'suggestCommonTableExpressions',
  'suggestDatabases',
  'suggestTables'
];

export function adjustForPartialBackticks(parser) {
  const partials = parser.yy.partialLengths;
  if (parser.yy.result && partials.backtickBefore && !partials.backtickAfter) {
    APPEND_BACKTICK_SUGGESTIONS.forEach(suggestionType => {
      if (parser.yy.result[suggestionType]) {
        parser.yy.result[suggestionType].appendBacktick = true;
      }
    });
  }
}

export function initSharedAutocomplete(parser) {
  parser.SELECT_FIRST_OPTIONAL_KEYWORDS = [
    { value: 'ALL', weight: 2 },
    { value: 'DISTINCT', weight: 2 }
  ];

  const adjustLocationForCursor = location => {
    // columns are 0-based and lines not, so add 1 to cols
    const newLocation = {
      first_line: location.first_line,
      last_line: location.last_line,
      first_column: location.first_column + 1,
      last_column: location.last_column + 1
    };

    if (parser.yy.cursorFound) {
      if (parser.yy.cursorFound.first_line === newLocation.first_line && parser.yy.cursorFound.last_column <= newLocation.first_column) {
        let additionalSpace = parser.yy.partialLengths.left + parser.yy.partialLengths.right;
        additionalSpace -= parser.yy.partialCursor ? 1 : 3; // For some reason the normal cursor eats 3 positions.
        newLocation.first_column = newLocation.first_column + additionalSpace;
        newLocation.last_column = newLocation.last_column + additionalSpace;
      }
    }

    return newLocation;
  };

  parser.addAsteriskLocation = (location, identifierChain) => {
    parser.yy.locations.push({
      type: LOCATION_TYPES.ASTERISK,
      location: adjustLocationForCursor(location),
      identifierChain: identifierChain
    });
  };

  parser.addClauseLocation = (type, precedingLocation, locationIfPresent, isCursor) => {
    let location;
    if (isCursor) {
      if (parser.yy.partialLengths.left === 0 && parser.yy.partialLengths.right === 0) {
        location = {
          type: type,
          missing: true,
          location: adjustLocationForCursor({
            first_line: precedingLocation.last_line,
            first_column: precedingLocation.last_column,
            last_line: precedingLocation.last_line,
            last_column: precedingLocation.last_column
          })
        };
      } else {
        location = {
          type: type,
          missing: false,
          location: {
            first_line: locationIfPresent.last_line,
            first_column: locationIfPresent.last_column - 1,
            last_line: locationIfPresent.last_line,
            last_column:
              locationIfPresent.last_column -
              1 +
              parser.yy.partialLengths.right +
              parser.yy.partialLengths.left
          }
        };
      }
    } else {
      location = {
        type: type,
        missing: !locationIfPresent,
        location: adjustLocationForCursor(
          locationIfPresent || {
            first_line: precedingLocation.last_line,
            first_column: precedingLocation.last_column,
            last_line: precedingLocation.last_line,
            last_column: precedingLocation.last_column
          }
        )
      };
    }
    if (parser.isInSubquery()) {
      location.subquery = true;
    }
    parser.yy.locations.push(location);
  };

  parser.addColumnAliasLocation = (location, alias, parentLocation) => {
    const aliasLocation = {
      type: LOCATION_TYPES.ALIAS,
      source: 'column',
      alias: alias,
      location: adjustLocationForCursor(location),
      parentLocation: adjustLocationForCursor(parentLocation)
    };
    if (
      parser.yy.locations.length &&
      parser.yy.locations[parser.yy.locations.length - 1].type === 'column'
    ) {
      const closestColumn = parser.yy.locations[parser.yy.locations.length - 1];
      if (
        closestColumn.location.first_line === aliasLocation.parentLocation.first_line &&
        closestColumn.location.last_line === aliasLocation.parentLocation.last_line &&
        closestColumn.location.first_column === aliasLocation.parentLocation.first_column &&
        closestColumn.location.last_column === aliasLocation.parentLocation.last_column
      ) {
        parser.yy.locations[parser.yy.locations.length - 1].alias = alias;
      }
    }
    parser.yy.locations.push(aliasLocation);
  };

  parser.addColumnLocation = (location, identifierChain) => {
    const isVariable =
      identifierChain.length && /\${[^}]*}/.test(identifierChain[identifierChain.length - 1].name);
    if (isVariable) {
      parser.yy.locations.push({
        type: LOCATION_TYPES.VARIABLE,
        location: adjustLocationForCursor(location),
        value: identifierChain[identifierChain.length - 1].name
      });
    } else {
      parser.yy.locations.push({
        type: LOCATION_TYPES.COLUMN,
        location: adjustLocationForCursor(location),
        identifierChain: identifierChain,
        qualified: identifierChain.length > 1
      });
    }
  };

  parser.addCteAliasLocation = (location, alias) => {
    parser.yy.locations.push({
      type: LOCATION_TYPES.ALIAS,
      source: 'cte',
      alias: alias,
      location: adjustLocationForCursor(location)
    });
  };

  parser.addDatabaseLocation = (location, identifierChain) => {
    parser.yy.locations.push({
      type: LOCATION_TYPES.DATABASE,
      location: adjustLocationForCursor(location),
      identifierChain: identifierChain
    });
  };

  parser.addFileLocation = (location, path) => {
    parser.yy.locations.push({
      type: LOCATION_TYPES.FILE,
      location: adjustLocationForCursor(location),
      path: path
    });
  };

  parser.addFunctionLocation = (location, functionName) => {
    // Remove trailing '(' from location
    const adjustedLocation = {
      first_line: location.first_line,
      last_line: location.last_line,
      first_column: location.first_column,
      last_column: location.last_column - 1
    };
    parser.yy.locations.push({
      type: LOCATION_TYPES.FUNCTION,
      location: adjustLocationForCursor(adjustedLocation),
      function: functionName.toLowerCase()
    });
  };

  parser.addFunctionArgumentLocations = (functionName, expressions, identifierChain) => {
    if (!expressions || !expressions.length) {
      return;
    }
    expressions.forEach((details, idx) => {
      const location = {
        type: LOCATION_TYPES.FUNCTION_ARGUMENT,
        location: adjustLocationForCursor(details.location),
        function: functionName.toLowerCase(),
        argumentPosition: idx,
        identifierChain: identifierChain || [{ name: functionName }],
        expression: details.expression
      };

      if (details.suffix) {
        location.suffix = details.suffix;
      }
      parser.yy.locations.push(location);
    });
  };

  parser.addNewDatabaseLocation = (location, identifierChain) => {
    parser.yy.definitions.push({
      type: LOCATION_TYPES.DATABASE,
      location: adjustLocationForCursor(location),
      identifierChain: identifierChain
    });
  };

  parser.addNewTableLocation = (location, identifierChain, colSpec) => {
    const columns = [];
    if (colSpec) {
      colSpec.forEach(col => {
        columns.push({
          identifierChain: [col.identifier], // TODO: Complex
          type: col.type,
          location: adjustLocationForCursor(col.location)
        });
      });
    }
    parser.yy.definitions.push({
      type: LOCATION_TYPES.TABLE,
      location: adjustLocationForCursor(location),
      identifierChain: identifierChain,
      columns: columns
    });
  };

  parser.addStatementLocation = location => {
    // Don't report lonely cursor as a statement
    if (
      location.first_line === location.last_line &&
      Math.abs(location.last_column - location.first_column) === 1
    ) {
      return;
    }
    let adjustedLocation;
    if (
      parser.yy.cursorFound &&
      parser.yy.cursorFound.last_line === location.last_line &&
      parser.yy.cursorFound.first_column >= location.first_column &&
      parser.yy.cursorFound.last_column <= location.last_column
    ) {
      const additionalSpace = parser.yy.partialLengths.left + parser.yy.partialLengths.right;
      adjustedLocation = {
        first_line: location.first_line,
        last_line: location.last_line,
        first_column: location.first_column + 1,
        last_column: location.last_column + additionalSpace - (parser.yy.partialCursor ? 0 : 2)
      };
    } else {
      adjustedLocation = {
        first_line: location.first_line,
        last_line: location.last_line,
        first_column: location.first_column + 1,
        last_column: location.last_column + 1
      };
    }

    parser.yy.locations.push({
      type: LOCATION_TYPES.STATEMENT,
      location: adjustedLocation
    });
  };

  parser.addStatementTypeLocation = (identifier, location, additionalText) => {
    // Don't add if already there except for SELECT
    if (identifier !== 'SELECT' && parser.yy.allLocations) {
      for (let i = parser.yy.allLocations.length - 1; i >= 0; i--) {
        if (
          parser.yy.allLocations[i] &&
          parser.yy.allLocations[i].type === LOCATION_TYPES.STATEMENT
        ) {
          break;
        }
        if (
          parser.yy.allLocations[i] &&
          parser.yy.allLocations[i].type === LOCATION_TYPES.STATEMENT_TYPE
        ) {
          return;
        }
      }
    }
    const loc = {
      type: LOCATION_TYPES.STATEMENT_TYPE,
      location: adjustLocationForCursor(location),
      identifier: identifier
    };
    if (typeof additionalText !== 'undefined') {
      switch (identifier) {
        case 'ALTER':
          if (/ALTER\s+VIEW/i.test(additionalText)) {
            loc.identifier = 'ALTER VIEW';
          } else {
            loc.identifier = 'ALTER TABLE';
          }
          break;
        case 'COMPUTE':
          loc.identifier = 'COMPUTE STATS';
          break;
        case 'CREATE':
          if (/CREATE\s+VIEW/i.test(additionalText)) {
            loc.identifier = 'CREATE VIEW';
          } else if (/CREATE\s+TABLE/i.test(additionalText)) {
            loc.identifier = 'CREATE TABLE';
          } else if (/CREATE\s+DATABASE/i.test(additionalText)) {
            loc.identifier = 'CREATE DATABASE';
          } else if (/CREATE\s+ROLE/i.test(additionalText)) {
            loc.identifier = 'CREATE ROLE';
          } else if (/CREATE\s+FUNCTION/i.test(additionalText)) {
            loc.identifier = 'CREATE FUNCTION';
          } else {
            loc.identifier = 'CREATE TABLE';
          }
          break;
        case 'DROP':
          if (/DROP\s+VIEW/i.test(additionalText)) {
            loc.identifier = 'DROP VIEW';
          } else if (/DROP\s+TABLE/i.test(additionalText)) {
            loc.identifier = 'DROP TABLE';
          } else if (/DROP\s+DATABASE/i.test(additionalText)) {
            loc.identifier = 'DROP DATABASE';
          } else if (/DROP\s+ROLE/i.test(additionalText)) {
            loc.identifier = 'DROP ROLE';
          } else if (/DROP\s+STATS/i.test(additionalText)) {
            loc.identifier = 'DROP STATS';
          } else if (/DROP\s+FUNCTION/i.test(additionalText)) {
            loc.identifier = 'DROP FUNCTION';
          } else {
            loc.identifier = 'DROP TABLE';
          }
          break;
        case 'INVALIDATE':
          loc.identifier = 'INVALIDATE METADATA';
          break;
        case 'LOAD':
          loc.identifier = 'LOAD DATA';
          break;
        case 'TRUNCATE':
          loc.identifier = 'TRUNCATE TABLE';
          break;
        default:
      }
    }
    parser.yy.locations.push(loc);
  };

  parser.addSubqueryAliasLocation = (location, alias) => {
    parser.yy.locations.push({
      type: LOCATION_TYPES.ALIAS,
      source: 'subquery',
      alias: alias,
      location: adjustLocationForCursor(location)
    });
  };

  parser.addTableAliasLocation = (location, alias, identifierChain) => {
    parser.yy.locations.push({
      type: LOCATION_TYPES.ALIAS,
      source: 'table',
      alias: alias,
      location: adjustLocationForCursor(location),
      identifierChain: identifierChain
    });
  };

  parser.addTableLocation = (location, identifierChain) => {
    parser.yy.locations.push({
      type: LOCATION_TYPES.TABLE,
      location: adjustLocationForCursor(location),
      identifierChain: identifierChain
    });
  };

  parser.addVariableLocation = (location, value) => {
    if (/\${[^}]*}/.test(value)) {
      parser.yy.locations.push({
        type: LOCATION_TYPES.VARIABLE,
        location: adjustLocationForCursor(location),
        value: value
      });
    }
  };

  parser.addUnknownLocation = (location, identifierChain) => {
    const isVariable =
      identifierChain.length && /\${[^}]*}/.test(identifierChain[identifierChain.length - 1].name);
    let loc;
    if (isVariable) {
      loc = {
        type: LOCATION_TYPES.VARIABLE,
        location: adjustLocationForCursor(location),
        value: identifierChain[identifierChain.length - 1].name
      };
    } else {
      loc = {
        type: LOCATION_TYPES.UNKNOWN,
        location: adjustLocationForCursor(location),
        identifierChain: identifierChain,
        qualified: identifierChain.length > 1
      };
    }
    parser.yy.locations.push(loc);
    return loc;
  };

  parser.applyTypes = (suggestion, typeDetails) => {
    suggestion.types = typeDetails.types;
    if (typeDetails.types && typeDetails.types[0] === 'UDFREF') {
      if (typeDetails.function) {
        suggestion.udfRef = typeDetails.function;
      } else {
        suggestion.types = ['T'];
      }
    }
  };

  parser.applyTypeToSuggestions = details => {
    if (!details.types) {
      console.trace();
    }
    if (details.types[0] === 'BOOLEAN') {
      return;
    }
    if (parser.yy.result.suggestFunctions && !parser.yy.result.suggestFunctions.types) {
      parser.applyTypes(parser.yy.result.suggestFunctions, details);
    }
    if (parser.yy.result.suggestColumns && !parser.yy.result.suggestColumns.types) {
      parser.applyTypes(parser.yy.result.suggestColumns, details);
    }
  };

  parser.extractExpressionText = (result, ...expressions) => {
    const parts = [];

    const fail = expressions.some(expression => {
      if (typeof expression === 'undefined') {
        // Skip undefined (optionals)
        return false;
      }
      if (typeof expression === 'string' || typeof expression === 'number') {
        parts.push(expression);
      } else if (typeof expression === 'object') {
        if (expression.text) {
          parts.push(expression.text);
        } else if (expression.columnReference) {
          parts.push(expression.columnReference.map(ref => ref.name).join('.'));
        } else {
          return true;
        }
      }
    });

    if (!fail) {
      result.text = parts.join(' ');
    }
  };

  parser.getSubQuery = cols => {
    const columns = [];
    cols.selectList.forEach(col => {
      const result = {};
      if (col.alias) {
        result.alias = col.alias;
      }
      if (col.valueExpression && col.valueExpression.columnReference) {
        result.identifierChain = col.valueExpression.columnReference;
      } else if (col.asterisk) {
        result.identifierChain = [{ asterisk: true }];
      }
      if (
        col.valueExpression &&
        col.valueExpression.types &&
        col.valueExpression.types.length === 1
      ) {
        result.type = col.valueExpression.types[0];
        if (result.type === 'UDFREF') {
          if (col.valueExpression.function) {
            result.udfRef = col.valueExpression.function;
          } else {
            result.type = ['T'];
          }
        }
      }

      columns.push(result);
    });

    return {
      columns: columns
    };
  };

  const PARTIAL_BEFORE_REGEX = /[0-9a-zA-Z_`]*$/;
  const PARTIAL_AFTER_REGEX = /^[0-9a-zA-Z_`]*(?:\((?:[^)]*\))?)?/;

  parser.identifyPartials = function (beforeCursor, afterCursor) {
    const beforeMatch = beforeCursor.match(PARTIAL_BEFORE_REGEX);
    const afterMatch = afterCursor.match(PARTIAL_AFTER_REGEX);
    return {
      left: beforeMatch ? beforeMatch[0].length : 0,
      right: afterMatch ? afterMatch[0].length : 0,
      backtickBefore: beforeMatch && beforeMatch[0].indexOf('`') !== -1,
      backtickAfter: afterMatch && afterMatch[0].indexOf('`') !== -1
    };
  };

  parser.suggestKeywords = keywords => {
    if (typeof keywords === 'string') {
      keywords = (parser.KEYWORDS && parser.KEYWORDS[keywords]) || [];
    }

    const weightedKeywords = [];
    if (keywords.length === 0) {
      return;
    }
    keywords.forEach(keyword => {
      if (typeof keyword.weight !== 'undefined') {
        weightedKeywords.push(keyword);
      } else {
        weightedKeywords.push({ value: keyword, weight: -1 });
      }
    });
    weightedKeywords.sort((a, b) => {
      if (a.weight !== b.weight) {
        return b.weight - a.weight;
      }
      return a.value.localeCompare(b.value);
    });
    parser.yy.result.suggestKeywords = weightedKeywords;
  };

  parser.valueExpressionSuggest = (oppositeValueExpression, operator) => {
    if (oppositeValueExpression && oppositeValueExpression.columnReference) {
      parser.suggestValues();
      parser.yy.result.colRef = { identifierChain: oppositeValueExpression.columnReference };
    }
    parser.suggestColumns();
    parser.suggestFunctions();
    let keywords = [
      { value: 'CASE', weight: 450 },
      { value: 'FALSE', weight: 450 },
      { value: 'NULL', weight: 450 },
      { value: 'TRUE', weight: 450 }
    ];
    if (typeof oppositeValueExpression === 'undefined' || typeof operator === 'undefined') {
      keywords = keywords.concat(['EXISTS', 'NOT']);
    }
    if (oppositeValueExpression && oppositeValueExpression.types[0] === 'NUMBER') {
      parser.applyTypeToSuggestions(oppositeValueExpression);
    }
    parser.suggestKeywords(keywords);
  };
}