# Petriflow.js

[![Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-green)](https://www.apache.org/licenses/LICENSE-2.0)
[![Typescript 4.4.3](https://img.shields.io/badge/Typescript-4.4.3-blue)](https://www.typescriptlang.org/)
[![Petriflow 1.0.0](https://img.shields.io/badge/Petriflow-1.0.0-0aa8ff)](https://petriflow.com)
[![build](https://github.com/netgrif/petriflow.js/actions/workflows/master-build.yml/badge.svg)](https://github.com/netgrif/petriflow.js/actions/workflows/release-build.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=netgrif_petriflow.js&metric=alert_status)](https://sonarcloud.io/dashboard?id=netgrif_petriflow.js)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=netgrif_petriflow.js&metric=coverage)](https://sonarcloud.io/dashboard?id=netgrif_petriflow.js)

> Petriflow in Javascript world

Petriflow.js is a Javascript library of Petriflow objects, written in Typescript. The library is for those who want to integrate Petriflow
processes into their applications. The library is updated together with the Petriflow specification to ensure up-to-date compatibility.
The library also contains functions to parse Petriflow files to Javascript objects and to export Javascript Objects to Petriflow source code.

Full specification of Petriflow low-code language can be found in [Petriflow repository](https://github.com/netgrif/petriflow.js) 

## Install
First, make sure you have installed the latest version of Node.js and npm with it (You may need to restart your computer after this step).

You can install it with the following command:
```shell
npm install --save @netgrif/petriflow
```

### Requirements

Currently, the library **only supports browser applications** because **requires DOM Web API** to correctly process Petriflow files.
It can be used in Node.js environments with installed the latest release of the [jsdom](https://github.com/jsdom/jsdom) library.

## Usage

The library support both CommonJS and ES Modules importing systems.

For applications that use the CommonJS module system you can use require function, i.e.:
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
The root object is [PetriNet](https://github.com/netgrif/petriflow.js/blob/master/src/lib/model/petri-net.ts) which contains all information from the Petriflow process. Every object in the library has
`T.clone() => T` method to return a new object of the same type and with the same values, to support clean code design and
immutability of parsed objects.

### Import service

`ImportService` class has methods to parse Petriflow XML files to usable objects.

The class can be used to parse the whole file at once or parse only parts of the XML file.

##### Import example
```javascript
import {ImportService, PetriNetResult} from '@netgrif/petriflow';

fetch('https://raw.githubusercontent.com/netgrif/petriflow/main/examples/order-approval.xml').then(result => {
    const net = new ImportService().parseFromXml(result);
    console.log('Net id: ' + net.model.id); 
});
```

### Export service

`ExportService` class has methods to export your Petriflow objects to an XML file.

The class can be used to serialize the whole process at once or only parts of it. Methods use DOM API to create Petriflow XML file.

##### Export example
```javascript
import {ExportService, PetriNet} from '@netgrif/petriflow';

const net = new PetriNet();
const xml = new ExportService().exportXml(net);
console.log(xml);
```

## Reporting issues

If you find a bug, let us know. First, please read our [Contribution guide](https://github.com/netgrif/petriflow.js/blob/master/CONTRIBUTING.md)

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
either express or implied. See the License for the specific language governing permissions and limitations under the License.
