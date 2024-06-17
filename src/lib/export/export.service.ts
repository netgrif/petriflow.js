import {
    Arc,
    AssignPolicy,
    CaseEvent,
    Component,
    DataGroup,
    DataLayout,
    DataRef,
    DataRefBehavior,
    Event,
    FinishPolicy,
    LayoutType,
    NodeElement,
    PetriNet,
    ProcessEvent,
    ProcessRoleRef,
    ProcessUserRef,
    Property,
    RoleRef,
    TransitionEvent,
    TransitionLayout,
    TriggerType
} from '../model';
import {ExportUtils} from './export-utils';

export class ExportService {

    public static readonly PETRIFLOW_SCHEMA_URL = 'https://petriflow.com/petriflow.schema.xsd';

    protected xmlConstructor = document.implementation.createDocument(null, 'document', null);

    constructor(protected _exportUtils: ExportUtils = new ExportUtils()) {
    }

    public exportXml(model: PetriNet): string {
        const xmlText = this.generateXml(model);
        return new XMLSerializer().serializeToString(xmlText);
    }

    public generateXml(model: PetriNet): Element {
        const doc = this.xmlConstructor.createElement('process');
        doc.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        doc.setAttribute('xsi:noNamespaceSchemaLocation', ExportService.PETRIFLOW_SCHEMA_URL);
        this.exportModel(doc, model);
        this.exportProcessRefs(doc, model);
        this.exportProcessEvents(doc, model);
        this.exportRoles(doc, model);
        this.exportFunctions(doc, model);
        this.exportData(doc, model);
        // TODO mapping
        this.exportI18n(doc, model);
        this.exportTransitions(doc, model);
        this.exportPlaces(doc, model);
        this.exportArcs(doc, model);
        return doc;
    }

    public exportModel(doc: Element, model: PetriNet): void {
        this._exportUtils.exportTag(doc, 'id', model.id, true);
        this._exportUtils.exportTag(doc, 'version', model.version);
        this._exportUtils.exportTag(doc, 'title', model.title, true);
        this._exportUtils.exportTag(doc, 'icon', model.icon);
        this._exportUtils.exportTag(doc, 'defaultRole', model.defaultRole !== undefined ? (model.defaultRole.toString()) : '');
        this._exportUtils.exportTag(doc, 'anonymousRole', model.anonymousRole !== undefined ? (model.anonymousRole.toString()) : '');
        this._exportUtils.exportTag(doc, 'caseName', model.caseName);
    }

    public exportRoles(doc: Element, model: PetriNet): void {
        model.getRoles().forEach(item => {
            const role = this.xmlConstructor.createElement('role');
            this._exportUtils.exportTag(role, 'id', item.id, true);
            this._exportUtils.exportTag(role, 'title', item.title, true);
            item.getEvents().forEach(event => {
                this.exportEvent(role, event);
            });
            if (item.properties !== undefined) {
                this.exportProperties(role, item.properties)
            }
            role.setAttribute("scope", item.scope.toString());
            doc.appendChild(role);
        });
    }

    public exportFunctions(doc: Element, model: PetriNet): void {
        model.functions.forEach(_function => {
            this._exportUtils.exportFunction(doc, _function);
        });
    }

    public exportEvent<T>(element: Element, event: Event<T>): void {
        if (event.isEmpty()) {
            return
        }
        let exportProcessEvent;
        if (event instanceof ProcessEvent) {
            exportProcessEvent = this.xmlConstructor.createElement('processEvents');
        } else if (event instanceof CaseEvent) {
            exportProcessEvent = this.xmlConstructor.createElement('caseEvents');
        }
        const exportEvent = this.xmlConstructor.createElement('event');
        this._exportUtils.exportTag(exportEvent, 'id', event.id);
        exportEvent.setAttribute('type', `${event.type}`);
        if (event instanceof TransitionEvent) {
            this._exportUtils.exportTag(exportEvent, 'title', (event as TransitionEvent).title);
            this._exportUtils.exportTag(exportEvent, 'message', (event as TransitionEvent).message);
        }
        if (event.preActions.length > 0) {
            this._exportUtils.exportActions(exportEvent, event, 'pre');
        }
        if (event.postActions.length > 0) {
            this._exportUtils.exportActions(exportEvent, event, 'post');
        }
        if (event.properties !== undefined && event.properties.length > 0) {
            this.exportProperties(exportEvent, event.properties);
        }

        if ((event instanceof ProcessEvent || event instanceof CaseEvent) && !!exportProcessEvent) {
            exportProcessEvent.appendChild(exportEvent);
            element.appendChild(exportProcessEvent);
        } else {
            element.appendChild(exportEvent);
        }
    }

    public exportProperties(element: Element, properties: Array<Property>): void {
        if (!properties || properties.length === 0) {
            return
        }
        const props = this.xmlConstructor.createElement('properties');
        properties.forEach(property => {
            this._exportUtils.exportTag(props, 'property', property.value, false, [{
                key: 'key',
                value: property.key,
            }])
        })
        element.appendChild(props);
    }

    public exportProcessRefs(doc: Element, model: PetriNet): void {
        model.getRoleRefs().forEach(roleRef => {
            this.exportProcessRef(doc, roleRef);
        });
        model.getUserRefs().forEach(userRef => {
            this.exportProcessRef(doc, userRef);
        });
    }

    public exportProcessRef(element: Element, ref: ProcessRoleRef | ProcessUserRef): void {
        if (ref.caseLogic.create !== undefined ||
            ref.caseLogic.delete !== undefined ||
            ref.caseLogic.view !== undefined) {
            const processRef = this.xmlConstructor.createElement(ref instanceof ProcessRoleRef ? 'roleRef' : 'userRef');
            this._exportUtils.exportTag(processRef, 'id', ref.id, true);
            this._exportUtils.exportCaseLogic(processRef, ref.caseLogic, 'caseLogic');
            element.appendChild(processRef);
        }
    }

    public exportTransitionRef(element: Element, ref: RoleRef): void {
        if (ref.logic.perform !== undefined ||
            ref.logic.reassign !== undefined ||
            ref.logic.assign !== undefined ||
            ref.logic.cancel !== undefined ||
            ref.logic.viewDisabled !== undefined ||
            ref.logic.view !== undefined) {
            const transRef = this.xmlConstructor.createElement('roleRef');
            this._exportUtils.exportTag(transRef, 'id', ref.id, true);
            this._exportUtils.exportLogic(transRef, ref.logic, 'logic');
            if (ref.properties !== undefined) {
                this.exportProperties(transRef, ref.properties)
            }
            element.appendChild(transRef);
        }
    }

    public exportProcessEvents(doc: Element, model: PetriNet): void {
        model.getProcessEvents().forEach(event => {
            this.exportEvent(doc, event);
        });
        model.getCaseEvents().forEach(event => {
            this.exportEvent(doc, event);
        });
    }

    public exportData(doc: Element, model: PetriNet): void {
        model.getDataSet().forEach(data => {
            const exportData = this.xmlConstructor.createElement('data');
            exportData.setAttribute('type', data.type);
            if (data.immediate) {
                exportData.setAttribute('immediate', data.immediate.toString());
            }
            this._exportUtils.exportTag(exportData, 'id', data.id, true);
            this._exportUtils.exportTag(exportData, 'title', data.title, true);
            this._exportUtils.exportTag(exportData, 'placeholder', data.placeholder);
            this._exportUtils.exportTag(exportData, 'desc', data.desc);
            if (data.options.length > 0) {
                const options = this.xmlConstructor.createElement('options');
                data.options.forEach(opt => this._exportUtils.exportTag(options, 'option', opt.value, false, [{
                    key: 'key',
                    value: opt.key
                }]));
                exportData.appendChild(options);
            }
            if (!!data.validations && (data.validations?.length ?? 0) > 0) {
                const validations = this.xmlConstructor.createElement('validations');
                data.validations?.forEach(validation => {
                    const valid = this.xmlConstructor.createElement('validation');
                    this._exportUtils.exportExpression(valid, 'expression', validation.expression);
                    this._exportUtils.exportTag(valid, 'message', validation.message);
                    validations.appendChild(valid);
                });
                exportData.appendChild(validations);
            }
            this._exportUtils.exportI18nWithDynamic(exportData, 'init', data.init);
            if (data.component !== undefined) {
                this.exportComponent(exportData, data.component);
            }
            if (data.encryption !== undefined) {
                if (data.encryption === 'true') {
                    this._exportUtils.exportTag(exportData, 'encryption', 'true');
                } else {
                    this._exportUtils.exportTag(exportData, 'encryption', 'true', false, [{
                        key: 'algorithm',
                        value: data.encryption
                    }]);
                }
            }
            data.getEvents().forEach(event => {
                this.exportEvent(exportData, event);
            });
            data.actionRef?.forEach(action => {
                const ref = this.xmlConstructor.createElement('actionRef');
                this._exportUtils.exportTag(ref, 'id', action);
                exportData.appendChild(ref);
            });
            if (data.properties !== undefined) {
                this.exportProperties(exportData, data.properties)
            }
            // TODO: documentRef
            if (data.allowedNets?.length > 0) {
                const nets = this.xmlConstructor.createElement('allowedNets');
                data.allowedNets?.forEach(item => this._exportUtils.exportTag(nets, 'allowedNet', item));
                exportData.appendChild(nets);
            }
            doc.appendChild(exportData);
        });
    }

    public exportI18n(doc: Element, model: PetriNet): void {
        model.getI18ns().forEach(translations => {
            const i18ns = this.xmlConstructor.createElement('i18n');
            i18ns.setAttribute('locale', translations.locale);
            translations.getI18ns().forEach(i18n => {
                this._exportUtils.exportTag(i18ns, 'i18nString', i18n.value, false, [{
                    key: 'id',
                    value: i18n.id ?? ''
                }]);
            });
            doc.appendChild(i18ns);
        });
    }

    public exportTransitions(doc: Element, model: PetriNet): void {
        model.getTransitions().forEach(trans => {
            const exportTrans = this.xmlConstructor.createElement('transition');
            this._exportUtils.exportTag(exportTrans, 'id', trans.id, true);
            this._exportUtils.exportTag(exportTrans, 'x', trans.x?.toString(), true);
            this._exportUtils.exportTag(exportTrans, 'y', trans.y?.toString(), true);
            this._exportUtils.exportTag(exportTrans, 'title', trans.title, true);
            if (trans.layout && !trans.layout.empty()) {
                this.exportTransitionLayout(exportTrans, trans.layout);
            }
            this._exportUtils.exportTag(exportTrans, 'icon', trans.icon ?? '');
            this._exportUtils.exportTag(exportTrans, 'assignPolicy', trans.assignPolicy === AssignPolicy.MANUAL ? '' : trans.assignPolicy);
            this._exportUtils.exportTag(exportTrans, 'finishPolicy', trans.finishPolicy === FinishPolicy.MANUAL ? '' : trans.finishPolicy);
            trans.triggers.forEach(trigger => {
                if (trigger.type !== TriggerType.TIME) {
                    const exportTrigger = this.xmlConstructor.createElement('trigger');
                    exportTrigger.setAttribute('type', trigger.type);
                    exportTrans.appendChild(exportTrigger);
                } else {
                    if (trigger.delay !== undefined && trigger.delay !== '') {
                        const exportTrigger = this.xmlConstructor.createElement('trigger');
                        exportTrigger.setAttribute('type', trigger.type);
                        this._exportUtils.exportTag(exportTrigger, 'delay', trigger.delay);
                        exportTrans.appendChild(exportTrigger);
                    } else if (trigger.exact !== undefined) {
                        const exportTrigger = this.xmlConstructor.createElement('trigger');
                        exportTrigger.setAttribute('type', trigger.type);
                        this._exportUtils.exportTag(exportTrigger, 'exact', trigger.exact.toISOString());
                        exportTrans.appendChild(exportTrigger);
                    }
                }
            });
            trans.roleRefs.forEach(roleRef => {
                this.exportTransitionRef(exportTrans, roleRef);
            });
            trans.dataGroups.forEach(dataGroup => {
                this.exportDataGroup(exportTrans, dataGroup);
            });
            if (trans.properties !== undefined) {
                this.exportProperties(exportTrans, trans.properties)
            }
            trans.eventSource.getEvents().forEach(event => {
                this.exportEvent(exportTrans, event);
            });
            doc.appendChild(exportTrans);
        });
    }

    public exportDataRef(element: Element, dataRef: DataRef): void {
        const exportDataRef = this.xmlConstructor.createElement('dataRef');
        this._exportUtils.exportTag(exportDataRef, 'id', dataRef.id, true);
        if (dataRef.logic.behavior) {
            const logic = this.xmlConstructor.createElement('logic');
            if (dataRef.logic.behavior) {
                this._exportUtils.exportTag(logic, 'behavior', dataRef.logic.behavior);
            }
            if (dataRef.logic.required) {
                this._exportUtils.exportTag(logic, 'behavior', DataRefBehavior.REQUIRED);
            }
            if (dataRef.logic.immediate) {
                this._exportUtils.exportTag(logic, 'behavior', DataRefBehavior.IMMEDIATE);
            }
            exportDataRef.appendChild(logic);
        }
        this.exportDataRefLayout(exportDataRef, dataRef.layout);
        if (dataRef.component !== undefined) {
            this.exportComponent(exportDataRef, dataRef.component);
        }
        dataRef.getEvents().forEach(event => {
            this.exportEvent(exportDataRef, event);
        });
        if (dataRef.properties !== undefined) {
            this.exportProperties(exportDataRef, dataRef.properties)
        }
        element.appendChild(exportDataRef);
    }

    public exportComponent(element: Element, component: Component): void {
        const comp = this.xmlConstructor.createElement('component');
        this._exportUtils.exportTag(comp, 'id', component.id, true);
        component.properties.forEach(prop => this._exportUtils.exportTag(comp, 'property', prop.value, false, [{
            key: 'key',
            value: prop.key
        }]));
        element.appendChild(comp);
    }

    public exportDataRefLayout(element: Element, layout: DataLayout): void {
        if (layout !== undefined) {
            const exportLayout = this.xmlConstructor.createElement('layout');
            this._exportUtils.exportTag(exportLayout, 'x', layout.x?.toString());
            this._exportUtils.exportTag(exportLayout, 'y', layout.y?.toString());
            this._exportUtils.exportTag(exportLayout, 'rows', layout.rows?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'cols', layout.cols?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'offset', layout.offset?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'template', layout.template);
            this._exportUtils.exportTag(exportLayout, 'appearance', layout.appearance);
            this._exportUtils.exportTag(exportLayout, 'alignment', layout.alignment?.toString() ?? '');
            element.appendChild(exportLayout);
        }
    }

    public exportTransitionLayout(element: Element, layout: TransitionLayout): void {
        if (layout !== undefined) {
            const exportLayout = this.xmlConstructor.createElement('layout');
            this._exportUtils.exportTag(exportLayout, 'cols', layout.cols?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'rows', layout.rows?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'offset', layout.offset?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'fieldAlignment', layout.alignment?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'hideEmptyRows', layout.hideEmptyRows?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'compactDirection', layout.compactDirection?.toString() ?? '');
            if (layout.type && layout.type !== LayoutType.LEGACY) {
                exportLayout.setAttribute('type', layout.type);
            }
            element.appendChild(exportLayout);
        }
    }

    public exportDataGroup(element: Element, dataGroup: DataGroup): void {
        const exportGroup = this.xmlConstructor.createElement('dataGroup');
        this._exportUtils.exportTag(exportGroup, 'id', dataGroup.id, true);
        this._exportUtils.exportTag(exportGroup, 'cols', dataGroup.cols?.toString() ?? '');
        this._exportUtils.exportTag(exportGroup, 'rows', dataGroup.rows?.toString() ?? '');
        this._exportUtils.exportTag(exportGroup, 'layout', dataGroup.layout ?? '');
        this._exportUtils.exportTag(exportGroup, 'title', dataGroup.title ?? '');
        this._exportUtils.exportTag(exportGroup, 'alignment', dataGroup.alignment ?? '');
        this._exportUtils.exportTag(exportGroup, 'stretch', !dataGroup.stretch ? '' : dataGroup.stretch?.toString());
        this._exportUtils.exportTag(exportGroup, 'hideEmptyRows', dataGroup.hideEmptyRows?.toString() ?? '');
        this._exportUtils.exportTag(exportGroup, 'compactDirection', dataGroup.compactDirection?.toString() ?? '');
        dataGroup.getDataRefs().sort(this.dataRefOrder).forEach(dataRef => this.exportDataRef(exportGroup, dataRef));
        element.appendChild(exportGroup);
    }

    public exportPlaces(doc: Element, model: PetriNet): void {
        model.getPlaces().forEach(place => {
            const exportPlace = this.xmlConstructor.createElement('place');
            this._exportUtils.exportTag(exportPlace, 'id', place.id, true);
            this._exportUtils.exportTag(exportPlace, 'x', place.x?.toString(), true);
            this._exportUtils.exportTag(exportPlace, 'y', place.y?.toString(), true);
            this._exportUtils.exportTag(exportPlace, 'title', place.title);
            this._exportUtils.exportTag(exportPlace, 'tokens', place.marking?.toString());
            this._exportUtils.exportTag(exportPlace, 'static', place.static?.toString());
            if (place.properties !== undefined) {
                this.exportProperties(exportPlace, place.properties)
            }
            exportPlace.setAttribute("scope", place.scope?.toString());
            doc.appendChild(exportPlace);
        });
    }

    public exportArcs(doc: Element, model: PetriNet): void {
        model.getArcs().forEach(arc => {
            const exportArc = this.xmlConstructor.createElement('arc');
            this._exportUtils.exportTag(exportArc, 'id', arc.id, true);
            this._exportUtils.exportTag(exportArc, 'type', this._exportUtils.exportArcType(arc.type));
            this._exportUtils.exportTag(exportArc, 'sourceId', arc.source.id);
            this._exportUtils.exportTag(exportArc, 'destinationId', arc.destination.id);
            this._exportUtils.exportExpression(exportArc, 'multiplicity', arc.multiplicity);
            if (arc.breakpoints !== undefined) {
                this.exportBreakpoints(exportArc, arc);
            }
            doc.appendChild(exportArc);
        });
    }

    public exportBreakpoints(exportArc: Element, arc: Arc<NodeElement, NodeElement>): void {
        arc.breakpoints.forEach((point) => {
            const breakPoint = this.xmlConstructor.createElement('breakpoint');
            this._exportUtils.exportTag(breakPoint, 'x', point.x?.toString());
            this._exportUtils.exportTag(breakPoint, 'y', point.y?.toString());
            exportArc.appendChild(breakPoint);
        });
    }

    public dataRefOrder(a: DataRef, b: DataRef): number {
        if (a?.layout?.y < b?.layout?.y) {
            return -1;
        }
        if (a?.layout?.y > b?.layout?.y) {
            return 1;
        }
        if (a?.layout?.x < b?.layout?.x) {
            return -1;
        }
        return 1;
    }
}
