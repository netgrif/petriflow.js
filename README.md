# Petriflow.js

![Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-green)
![Typescript 4.4.3](https://img.shields.io/badge/Typescript-4.4.3-blue)
![Petriflow 1.0.0](https://img.shields.io/badge/Petriflow-1.0.0-0aa8ff)
[![build](https://github.com/netgrif/petriflow.js/actions/workflows/release-build.yml/badge.svg)](https://github.com/netgrif/petriflow.js/actions/workflows/release-build.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=netgrif_petriflow.js&metric=alert_status)](https://sonarcloud.io/dashboard?id=netgrif_petriflow.js)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=netgrif_petriflow.js&metric=coverage)](https://sonarcloud.io/dashboard?id=netgrif_petriflow.js)

> Petriflow in Javascript world

Petriflow.js is a Javascript library written in Typescript of Petriflow objects. The library is for those who wants to integrate Petriflow
processes into their applications. The library is updated together with Petriflow specification to ensure up-to-date compatibility.
The library also contains functions to parse Petriflow file to Javascript objects and to export Javascript Objects to Petriflow source code.

Full specification of Petriflow low-code language can be found in [Petriflow repository](https://github.com/netgrif/petriflow.js) 

## Install
First make sure you have installed the latest version of Node.js and npm with it (You may need to restart your computer after this step).

You can install it with the following command:
```shell
npm install --save @netgrif/petriflow
```

## Usage

The library support both CommonJS and ES Modules importing systems.

For Node.js applications and applications that uses CommonJS module system you can use require function, i.e.:
```javascript
const {PetriNet, ImportService} = require('@netgrif/petriflow')
```

For applications supporting ES6+ modules you can use import statement, i.e.:

```javascript
import {PetriNet, ImportService} from "@netgrif/petriflow";
```

The library is also published with type declaration and so your Typescript project will automatically recognize all types and enumerations.

### Petriflow model

The library contains every object, constant, and structure to fully interpret Petriflow source code files in Javascript.
The root object is [PetriNet](https://github.com/netgrif/petriflow.js/blob/master/src/lib/model/petri-net.ts) which contains all information from Petriflow process. Every object in the library has
`T.clone() => T` method to return new object of the same type and with the same values, to support clean code design and
immutability of parsed objects.

### Import service

`ImportService` class has methods to parse Petriflow XML files to usable objects. 

The class can be used to parse whole file at once or parse only parts of the xml file.

##### Node.js example
```javascript
const fs = require('fs');
const {ImportService, PetriNetResult} = require('@netgrif/petriflow');

const file = fs.readFileSync('/path/to/petriflow/file.xml');
const net = new ImportService().parseFromXml(file);
console.log('Net id: ' + net.model.id);
```

### Export service

`ExportService` class has methods to export your Petriflow objects to XML file.

The class can be used to serialize whole process at once or only parts of it. Methods use DOM API to create Petriflow XML file.

##### Node.js example
```javascript
const fs = require('fs');
const {ExportService, PetriNet} = require('@netgrif/petriflow');

const net = new PetriNet();
const xml = new ExportService().exportXml(net);
fs.writeFileSync('/path/to/new/file.xml', xml);
```

## Reporting issue

If you find a bug, let us know. First, please read our [Contribution guide](https://github.com/netgrif/petriflow.js/blob/master/CONTRIBUTING.md)

# License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this files except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
either express or implied. See the License for the specific language governing permissions and limitations under the License.
