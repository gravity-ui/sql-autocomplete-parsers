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


import { TypeConversion } from '../types';

export const TYPE_CONVERSION: TypeConversion = {
  BOOLEAN: {
    BOOLEAN: true,
    TIMESTAMP: false,
    TINYINT: false,
    SMALLINT: false,
    INT: false,
    BIGINT: false,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: false,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  TIMESTAMP: {
    BOOLEAN: false,
    TIMESTAMP: true,
    TINYINT: false,
    SMALLINT: false,
    INT: false,
    BIGINT: false,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: false,
    CHAR: false,
    VARCHAR: false,
    STRING: true,
    T: true
  },
  TINYINT: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: false,
    INT: false,
    BIGINT: false,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  SMALLINT: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: true,
    INT: false,
    BIGINT: false,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  INT: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: true,
    INT: true,
    BIGINT: false,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  BIGINT: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: true,
    INT: true,
    BIGINT: true,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  DOUBLE: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: true,
    INT: true,
    BIGINT: true,
    DOUBLE: true,
    REAL: true,
    DECIMAL: false,
    FLOAT: true,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  REAL: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: true,
    INT: true,
    BIGINT: true,
    DOUBLE: true,
    REAL: true,
    DECIMAL: false,
    FLOAT: true,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  DECIMAL: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: true,
    INT: true,
    BIGINT: true,
    DOUBLE: true,
    REAL: true,
    DECIMAL: true,
    FLOAT: true,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  FLOAT: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: true,
    INT: true,
    BIGINT: true,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: true,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  NUMBER: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: true,
    SMALLINT: true,
    INT: true,
    BIGINT: true,
    DOUBLE: true,
    REAL: true,
    DECIMAL: true,
    FLOAT: true,
    NUMBER: true,
    CHAR: false,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  CHAR: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: false,
    SMALLINT: false,
    INT: false,
    BIGINT: false,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: false,
    CHAR: true,
    VARCHAR: false,
    STRING: false,
    T: true
  },
  VARCHAR: {
    BOOLEAN: false,
    TIMESTAMP: false,
    TINYINT: false,
    SMALLINT: false,
    INT: false,
    BIGINT: false,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: false,
    CHAR: true,
    VARCHAR: true,
    STRING: false,
    T: true
  },
  STRING: {
    BOOLEAN: false,
    TIMESTAMP: true,
    TINYINT: false,
    SMALLINT: false,
    INT: false,
    BIGINT: false,
    DOUBLE: false,
    REAL: false,
    DECIMAL: false,
    FLOAT: false,
    NUMBER: false,
    CHAR: true,
    VARCHAR: false,
    STRING: true,
    T: true
  },
  T: {
    BOOLEAN: true,
    TIMESTAMP: true,
    TINYINT: true,
    SMALLINT: true,
    INT: true,
    BIGINT: true,
    DOUBLE: true,
    REAL: true,
    DECIMAL: true,
    FLOAT: true,
    NUMBER: true,
    CHAR: true,
    VARCHAR: true,
    STRING: true,
    T: true
  }
};
