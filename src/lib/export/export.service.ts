import {
    Arc,
    AssignPolicy,
    CaseEvent,
    Component,
    DataFocusPolicy,
    DataGroup,
    DataLayout,
    DataRef,
    DataRefBehavior,
    Event,
    FinishPolicy,
    IconType,
    Layout,
    LayoutType,
    PetriNet,
    ProcessEvent,
    ProcessRoleRef,
    ProcessUserRef,
    RoleRef,
    TransitionEvent,
    TransitionLayout,
    TriggerType,
    UserRef
} from '../model';
import {ExportUtils} from './export-utils';

export class ExportService {

    public static readonly PETRIFLOW_SCHEMA_URL = 'https://netgrif.github.io/petriflow/petriflow.schema.xsd';

    protected xmlConstructor = document.implementation.createDocument(null, 'document', null);

    constructor(protected exportUtils: ExportUtils = new ExportUtils()) {
    }

    public exportXml(model: PetriNet): string {
        const xmlText = this.generateXml(model);
        return new XMLSerializer().serializeToString(xmlText);
    }

    public generateXml(model: PetriNet): Element {
        const doc = this.xmlConstructor.createElement('document');
        doc.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        doc.setAttribute('xsi:noNamespaceSchemaLocation', ExportService.PETRIFLOW_SCHEMA_URL);
        this.exportModel(doc, model);
        this.exportProcessRefs(doc, model);
        this.exportProcessEvents(doc, model);
        this.exportTransactions(doc, model);
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
        this.exportUtils.exportTag(doc, 'id', model.id, true);
        this.exportUtils.exportTag(doc, 'version', model.version);
        this.exportUtils.exportTag(doc, 'initials', model.initials, true);
        this.exportUtils.exportTag(doc, 'title', model.title, true);
        this.exportUtils.exportTag(doc, 'icon', model.icon);
        this.exportUtils.exportTag(doc, 'defaultRole', model.defaultRole !== undefined ? (model.defaultRole.toString()) : '');
        this.exportUtils.exportTag(doc, 'anonymousRole', model.anonymousRole !== undefined ? (model.anonymousRole.toString()) : '');
        this.exportUtils.exportTag(doc, 'transitionRole', model.transitionRole !== undefined ? (model.transitionRole.toString()) : '');
        this.exportUtils.exportTag(doc, 'caseName', model.caseName);
    }

    public exportTransactions(doc: Element, model: PetriNet): void {
        model.getTransactions().forEach(item => {
            const trans = this.xmlConstructor.createElement('transaction');
            this.exportUtils.exportTag(trans, 'id', item.id, true);
            this.exportUtils.exportTag(trans, 'title', item.title, true);
            doc.appendChild(trans);
        });
    }

    public exportRoles(doc: Element, model: PetriNet): void {
        model.getRoles().forEach(item => {
            const role = this.xmlConstructor.createElement('role');
            this.exportUtils.exportTag(role, 'id', item.id, true);
            this.exportUtils.exportTag(role, 'title', item.title, true);
            item.getEvents().forEach(event => {
                this.exportEvent(role, event);
            });
            doc.appendChild(role);
        });
    }

    public exportFunctions(doc: Element, model: PetriNet): void {
        model.functions.forEach(_function => {
            this.exportUtils.exportFunction(doc, _function);
        });
    }

    public exportEvent<T>(element: Element, event: Event<T>): void {
        let exportProcessEvent;
        if (event instanceof ProcessEvent) {
            exportProcessEvent = this.xmlConstructor.createElement('processEvents');
        } else if (event instanceof CaseEvent) {
            exportProcessEvent = this.xmlConstructor.createElement('caseEvents');
        }
        const exportEvent = this.xmlConstructor.createElement('event');
        this.exportUtils.exportTag(exportEvent, 'id', event.id);
        exportEvent.setAttribute('type', `${event.type}`);
        if (event instanceof TransitionEvent) {
            this.exportUtils.exportTag(exportEvent, 'title', (event as TransitionEvent).title);
            this.exportUtils.exportTag(exportEvent, 'message', (event as TransitionEvent).message);
        }
        if (event.preActions.length > 0) {
            this.exportUtils.exportActions(exportEvent, event, 'pre');
        }
        if (event.postActions.length > 0) {
            this.exportUtils.exportActions(exportEvent, event, 'post');
        }
        if ((event instanceof ProcessEvent || event instanceof CaseEvent) && !!exportProcessEvent) {
            exportProcessEvent.appendChild(exportEvent);
            element.appendChild(exportProcessEvent);
        } else {
            element.appendChild(exportEvent);
        }
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
            this.exportUtils.exportTag(processRef, 'id', ref.id, true);
            this.exportUtils.exportCaseLogic(processRef, ref.caseLogic, 'caseLogic');
            element.appendChild(processRef);
        }
    }

    public exportTransitionRef(element: Element, ref: RoleRef | UserRef): void {
        if (ref.logic.perform !== undefined ||
            ref.logic.assign !== undefined ||
            ref.logic.cancel !== undefined ||
            ref.logic.delegate !== undefined ||
            ref.logic.view !== undefined) {
            const transRef = this.xmlConstructor.createElement(ref instanceof RoleRef ? 'roleRef' : 'userRef');
            this.exportUtils.exportTag(transRef, 'id', ref.id, true);
            this.exportUtils.exportLogic(transRef, ref.logic, 'logic');
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
            this.exportUtils.exportTag(exportData, 'id', data.id, true);
            this.exportUtils.exportTag(exportData, 'title', data.title, true);
            this.exportUtils.exportTag(exportData, 'placeholder', data.placeholder);
            this.exportUtils.exportTag(exportData, 'desc', data.desc);
            if (data.options.length > 0) {
                const options = this.xmlConstructor.createElement('options');
                data.options.forEach(opt => this.exportUtils.exportTag(options, 'option', opt.value, false, [{
                    key: 'key',
                    value: opt.key
                }]));
                this.exportUtils.exportExpression(options, 'init', data.optionsInit);
                exportData.appendChild(options);
            }
            if (!!data.validations && (data.validations?.length ?? 0) > 0) {
                const validations = this.xmlConstructor.createElement('validations');
                data.validations?.forEach(validation => {
                    const valid = this.xmlConstructor.createElement('validation');
                    this.exportUtils.exportExpression(valid, 'expression', validation.expression);
                    this.exportUtils.exportTag(valid, 'message', validation.message);
                    validations.appendChild(valid);
                });
                exportData.appendChild(validations);
            }
            this.exportUtils.exportExpression(exportData, 'init', data.init);
            if (data.inits.length > 0) {
                const inits = this.xmlConstructor.createElement('inits');
                data.inits.forEach(init => {
                    let attr;
                    if (init.dynamic) {
                        attr = [{
                            key: 'dynamic',
                            value: String(init.dynamic)
                        }];
                    }
                    this.exportUtils.exportTag(inits, 'init', init.expression, false, attr);
                });
                exportData.appendChild(inits);
            }
            if (data.component !== undefined) {
                this.exportComponent(exportData, data.component);
            }
            if (data.encryption !== undefined) {
                if (data.encryption === 'true') {
                    this.exportUtils.exportTag(exportData, 'encryption', 'true');
                } else {
                    this.exportUtils.exportTag(exportData, 'encryption', 'true', false, [{
                        key: 'algorithm',
                        value: data.encryption
                    }]);
                }
            }
            if (data.remote) {
                this.exportUtils.exportTag(exportData, 'remote', 'true');
            }
            data.actionRef?.forEach(action => {
                const ref = this.xmlConstructor.createElement('actionRef');
                this.exportUtils.exportTag(ref, 'id', action);
                exportData.appendChild(ref);
            });
            data.getEvents().forEach(event => {
                this.exportEvent(exportData, event);
            });
            if (data.length !== undefined) {
                this.exportUtils.exportTag(exportData, 'length', data.length?.toString());
            }
            if (data.allowedNets?.length > 0) {
                const nets = this.xmlConstructor.createElement('allowedNets');
                data.allowedNets?.forEach(item => this.exportUtils.exportTag(nets, 'allowedNet', item));
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
                this.exportUtils.exportTag(i18ns, 'i18nString', i18n.value, false, [{
                    key: 'name',
                    value: i18n.name ?? ''
                }]);
            });
            doc.appendChild(i18ns);
        });
    }

    public exportTransitions(doc: Element, model: PetriNet): void {
        model.getTransitions().forEach(trans => {
            const exportTrans = this.xmlConstructor.createElement('transition');
            this.exportUtils.exportTag(exportTrans, 'id', trans.id, true);
            this.exportUtils.exportTag(exportTrans, 'x', trans.x?.toString(), true);
            this.exportUtils.exportTag(exportTrans, 'y', trans.y?.toString(), true);
            this.exportUtils.exportTag(exportTrans, 'label', trans.label, true);
            if (trans.layout && !trans.layout.empty()) {
                this.exportTransitionLayout(exportTrans, trans.layout);
            }
            this.exportUtils.exportTag(exportTrans, 'icon', trans.icon ?? '');
            if (trans.priority) {
                this.exportUtils.exportTag(exportTrans, 'priority', `${trans.priority}`);
            }
            this.exportUtils.exportTag(exportTrans, 'assignPolicy', trans.assignPolicy === AssignPolicy.MANUAL ? '' : trans.assignPolicy);
            this.exportUtils.exportTag(exportTrans, 'finishPolicy', trans.finishPolicy === FinishPolicy.MANUAL ? '' : trans.finishPolicy);
            this.exportUtils.exportTag(exportTrans, 'dataFocusPolicy', trans.dataFocusPolicy === DataFocusPolicy.MANUAL ? '' : trans.dataFocusPolicy);
            trans.triggers.forEach(trigger => {
                if (trigger.type !== TriggerType.TIME) {
                    const exportTrigger = this.xmlConstructor.createElement('trigger');
                    exportTrigger.setAttribute('type', trigger.type);
                    exportTrans.appendChild(exportTrigger);
                } else {
                    if (trigger.delay !== undefined && trigger.delay !== '') {
                        const exportTrigger = this.xmlConstructor.createElement('trigger');
                        exportTrigger.setAttribute('type', trigger.type);
                        this.exportUtils.exportTag(exportTrigger, 'delay', trigger.delay);
                        exportTrans.appendChild(exportTrigger);
                    } else if (trigger.exact !== undefined) {
                        const exportTrigger = this.xmlConstructor.createElement('trigger');
                        exportTrigger.setAttribute('type', trigger.type);
                        this.exportUtils.exportTag(exportTrigger, 'exact', trigger.exact.toISOString());
                        exportTrans.appendChild(exportTrigger);
                    }
                }
            });
            this.exportUtils.exportTag(exportTrans, 'transactionRef', trans.transactionRef ?? '');
            trans.roleRefs.forEach(roleRef => {
                this.exportTransitionRef(exportTrans, roleRef);
            });
            trans.userRefs.forEach(userRef => {
                this.exportTransitionRef(exportTrans, userRef);
            });
            if (trans.assignedUser !== undefined) {
                const assignedUser = this.xmlConstructor.createElement('assignedUser');
                this.exportUtils.exportTag(assignedUser, 'cancel', trans.assignedUser.cancel?.toString() ?? '');
                this.exportUtils.exportTag(assignedUser, 'reassign', trans.assignedUser.reassign?.toString() ?? '');
                exportTrans.appendChild(assignedUser);
            }
            trans.dataGroups.forEach(dataGroup => {
                this.exportDataGroup(exportTrans, dataGroup);
            });
            trans.getEvents().forEach(event => {
                this.exportEvent(exportTrans, event);
            });
            doc.appendChild(exportTrans);
        });
    }

    public exportDataRef(element: Element, dataRef: DataRef): void {
        const exportDataRef = this.xmlConstructor.createElement('dataRef');
        this.exportUtils.exportTag(exportDataRef, 'id', dataRef.id, true);
        if (dataRef.logic.behavior || dataRef.logic.actionRefs?.length > 0) {
            const logic = this.xmlConstructor.createElement('logic');
            if (dataRef.logic.behavior) {
                this.exportUtils.exportTag(logic, 'behavior', dataRef.logic.behavior);
            }
            if (dataRef.logic.required) {
                this.exportUtils.exportTag(logic, 'behavior', DataRefBehavior.REQUIRED);
            }
            dataRef.logic.actionRefs.forEach(ref => {
                const actionRef = this.xmlConstructor.createElement('actionRef');
                this.exportUtils.exportTag(actionRef, 'id', ref);
                logic.appendChild(actionRef);
            });
            exportDataRef.appendChild(logic);
        }
        this.exportDataRefLayout(exportDataRef, dataRef.layout);
        if (dataRef.component !== undefined) {
            this.exportComponent(exportDataRef, dataRef.component);
        }
        dataRef.getEvents().forEach(event => {
            this.exportEvent(exportDataRef, event);
        });
        element.appendChild(exportDataRef);
    }

    public exportComponent(element: Element, component: Component): void {
        const comp = this.xmlConstructor.createElement('component');
        this.exportUtils.exportTag(comp, 'name', component.name, true);
        if (component.icons.length > 0) {
            const props = this.xmlConstructor.createElement('properties');
            component.properties.forEach(prop => this.exportUtils.exportTag(props, 'property', prop.value, false, [{
                key: 'key',
                value: prop.key
            }]));
            const icons = this.xmlConstructor.createElement('option_icons');
            component.icons.forEach(icon => {
                const attributes = [{key: 'key', value: icon.key}];
                if (icon.type && icon.type !== IconType.MATERIAL) {
                    attributes.push({key: 'type', value: icon.type});
                }
                this.exportUtils.exportTag(icons, 'icon', icon.icon, false, attributes);
            });
            props.appendChild(icons);
            comp.appendChild(props);
        } else {
            component.properties.forEach(prop => this.exportUtils.exportTag(comp, 'property', prop.value, false, [{
                key: 'key',
                value: prop.key
            }]));
        }
        element.appendChild(comp);
    }

    public exportDataRefLayout(element: Element, layout: DataLayout): void {
        if (layout !== undefined) {
            const exportLayout = this.xmlConstructor.createElement('layout');
            this.exportUtils.exportTag(exportLayout, 'x', layout.x?.toString());
            this.exportUtils.exportTag(exportLayout, 'y', layout.y?.toString());
            this.exportUtils.exportTag(exportLayout, 'rows', layout.rows?.toString() ?? '');
            this.exportUtils.exportTag(exportLayout, 'cols', layout.cols?.toString() ?? '');
            this.exportUtils.exportTag(exportLayout, 'offset', layout.offset?.toString() ?? '');
            this.exportUtils.exportTag(exportLayout, 'template', layout.template);
            this.exportUtils.exportTag(exportLayout, 'appearance', layout.appearance);
            this.exportUtils.exportTag(exportLayout, 'alignment', layout.alignment?.toString() ?? '');
            element.appendChild(exportLayout);
        }
    }

    public exportTransitionLayout(element: Element, layout: TransitionLayout): void {
        if (layout !== undefined) {
            const exportLayout = this.xmlConstructor.createElement('layout');
            this.exportLayout(exportLayout, layout);
            this.exportUtils.exportTag(exportLayout, 'fieldAlignment', layout.alignment?.toString() ?? '');
            if (layout.type && layout.type !== LayoutType.LEGACY) {
                exportLayout.setAttribute('type', layout.type);
            }
            element.appendChild(exportLayout);
        }
    }

    private exportLayout(exportLayout: Element, layout: Layout): void {
        this.exportUtils.exportTag(exportLayout, 'rows', layout.rows?.toString() ?? '');
        this.exportUtils.exportTag(exportLayout, 'cols', layout.cols?.toString() ?? '');
        this.exportUtils.exportTag(exportLayout, 'offset', layout.offset?.toString() ?? '');
    }

    public exportDataGroup(element: Element, dataGroup: DataGroup): void {
        const exportGroup = this.xmlConstructor.createElement('dataGroup');
        this.exportUtils.exportTag(exportGroup, 'id', dataGroup.id, true);
        this.exportUtils.exportTag(exportGroup, 'cols', dataGroup.cols?.toString() ?? '');
        this.exportUtils.exportTag(exportGroup, 'rows', dataGroup.rows?.toString() ?? '');
        this.exportUtils.exportTag(exportGroup, 'title', dataGroup.title ?? '');
        this.exportUtils.exportTag(exportGroup, 'layout', dataGroup.layout ?? '');
        this.exportUtils.exportTag(exportGroup, 'alignment', dataGroup.alignment ?? '');
        this.exportUtils.exportTag(exportGroup, 'stretch', !dataGroup.stretch ? '' : dataGroup.stretch?.toString());
        dataGroup.getDataRefs().forEach(dataRef => this.exportDataRef(exportGroup, dataRef));
        element.appendChild(exportGroup);
    }

    public exportPlaces(doc: Element, model: PetriNet): void {
        model.getPlaces().forEach(place => {
            const exportPlace = this.xmlConstructor.createElement('place');
            this.exportUtils.exportTag(exportPlace, 'id', place.id, true);
            this.exportUtils.exportTag(exportPlace, 'x', place.x?.toString(), true);
            this.exportUtils.exportTag(exportPlace, 'y', place.y?.toString(), true);
            this.exportUtils.exportTag(exportPlace, 'label', place.label);
            this.exportUtils.exportTag(exportPlace, 'tokens', place.marking?.toString());
            this.exportUtils.exportTag(exportPlace, 'static', place.static?.toString());
            doc.appendChild(exportPlace);
        });
    }

    public exportArcs(doc: Element, model: PetriNet): void {
        model.getArcs().forEach(arc => {
            const exportArc = this.xmlConstructor.createElement('arc');
            this.exportUtils.exportTag(exportArc, 'id', arc.id, true);
            this.exportUtils.exportTag(exportArc, 'type', arc.type);
            this.exportUtils.exportTag(exportArc, 'sourceId', arc.source);
            this.exportUtils.exportTag(exportArc, 'destinationId', arc.destination);
            this.exportUtils.exportTag(exportArc, 'reference', arc.reference ?? '');
            this.exportUtils.exportTag(exportArc, 'multiplicity', arc.multiplicity?.toString());
            if (arc.breakpoints !== undefined) {
                this.exportBreakpoints(exportArc, arc);
            }
            doc.appendChild(exportArc);
        });
    }

    public exportBreakpoints(exportArc: Element, arc: Arc): void {
        arc.breakpoints.forEach((point) => {
            const breakPoint = this.xmlConstructor.createElement('breakpoint');
            this.exportUtils.exportTag(breakPoint, 'x', point.x?.toString());
            this.exportUtils.exportTag(breakPoint, 'y', point.y?.toString());
            exportArc.appendChild(breakPoint);
        });
    }
}
