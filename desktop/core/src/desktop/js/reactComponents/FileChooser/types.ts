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

//TODO: the interface will change based on the new api to accomodate errors
export interface FileSystem {
  label: string;
  key: number;
  icon: JSX.Element;
  user_home_dir: string;
}

interface Stats {
  aclBit: boolean;
  atime: string;
  group: string;
  mode: number;
  mtime: string;
  path: string;
  size: number;
  user: string;
}

interface File {
  humansize: string;
  is_sentry_managed: boolean;
  mode: string;
  mtime: string;
  name: string;
  path: string;
  rwx: string;
  stats: Stats;
  type: string;
  url: string;
}
export interface BreadcrumbData {
  label: string;
  url: string;
}
export interface PathAndFileData {
  path: string;
  breadcrumbs: BreadcrumbData[];
  files: File[];
}
