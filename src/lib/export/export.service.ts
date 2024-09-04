import {
    Arc,
    AssignPolicy,
    CaseEvent,
    Component,
    DataRef,
    Event,
    FinishPolicy,
    FlexAlignContent,
    FlexAlignItems,
    FlexContainer,
    FlexContainerProperties,
    FlexDirection,
    FlexDisplay,
    FlexItem,
    FlexItemAlignSelf,
    FlexItemProperties,
    FlexJustifyContent,
    FlexWrap,
    GridAlignContent,
    GridAlignItems,
    GridContainer,
    GridContainerProperties,
    GridDisplay,
    GridItem,
    GridItemAlignSelf,
    GridItemProperties,
    GridJustifyContent,
    JustifyItems,
    JustifySelf,
    NodeElement,
    PetriNet,
    ProcessEvent,
    ProcessPermissionRef,
    ResourceScope,
    Transition,
    TransitionEvent,
    TransitionPermissionRef,
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
        this.exportI18n(doc, model);
        this.exportTransitions(doc, model);
        this.exportPlaces(doc, model);
        this.exportArcs(doc, model);
        return doc;
    }

    public exportModel(doc: Element, model: PetriNet): void {
        this._exportUtils.exportTag(doc, 'id', model.id, true);
        this._exportUtils.exportTag(doc, 'version', model.version);
        this._exportUtils.exportI18nString(doc, 'title', model.title, true);
        this._exportUtils.exportTag(doc, 'icon', model.icon);
        this._exportUtils.exportTag(doc, 'defaultRole', model.defaultRole !== undefined ? (model.defaultRole.toString()) : '');
        this._exportUtils.exportTag(doc, 'anonymousRole', model.anonymousRole !== undefined ? (model.anonymousRole.toString()) : '');
        this._exportUtils.exportTags(doc, model.properties);
        this._exportUtils.exportI18nWithDynamic(doc, 'caseName', model.caseName);
    }

    public exportRoles(doc: Element, model: PetriNet): void {
        model.getRoles().sort((a, b) => a.compare(b)).forEach(item => {
            const role = this.xmlConstructor.createElement('role');
            this._exportUtils.exportTag(role, 'id', item.id, true);
            this._exportUtils.exportI18nString(role, 'title', item.title, true);
            item.getEvents().forEach(event => {
                this.exportEvent(role, event);
            });
            if (item.properties !== undefined) {
                this.exportProperties(role, item.properties)
            }
            this.exportScope(item.scope, role);
            doc.appendChild(role);
        });
    }

    public exportFunctions(doc: Element, model: PetriNet): void {
        model.functions.sort((a, b) => a.name.localeCompare(b.name)).forEach(_function => {
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
            this._exportUtils.exportI18nString(exportEvent, 'title', (event as TransitionEvent).title);
            this._exportUtils.exportI18nString(exportEvent, 'message', (event as TransitionEvent).message);
        }
        if (event.preActions.length > 0) {
            this._exportUtils.exportActions(exportEvent, event, 'pre');
        }
        if (event.postActions.length > 0) {
            this._exportUtils.exportActions(exportEvent, event, 'post');
        }
        this.exportProperties(exportEvent, event.properties);

        if ((event instanceof ProcessEvent || event instanceof CaseEvent) && !!exportProcessEvent) {
            exportProcessEvent.appendChild(exportEvent);
            element.appendChild(exportProcessEvent);
        } else {
            element.appendChild(exportEvent);
        }
    }

    public exportProperties(element: Element, properties: Map<string, string>): void {
        if (!properties || properties.size === 0) {
            return
        }
        const props = this.xmlConstructor.createElement('properties');
        properties.forEach((value, key) => {
            this._exportUtils.exportTag(props, 'property', value, false, [{
                key: 'key',
                value: key,
            }])
        })
        element.appendChild(props);
    }

    public exportProcessRefs(doc: Element, model: PetriNet): void {
        model.getRoleRefs().sort((a, b) => a.compare(b)).forEach(roleRef => {
            this.exportProcessRef(doc, roleRef, 'roleRef');
        });
        model.getUserRefs().sort((a, b) => a.id.localeCompare(b.id)).forEach(userRef => {
            this.exportProcessRef(doc, userRef, 'userRef');
        });
    }

    public exportProcessRef(element: Element, ref: ProcessPermissionRef, name: string): void {
        if (ref.logic.create !== undefined ||
            ref.logic.delete !== undefined ||
            ref.logic.view !== undefined) {
            const processRef = this.xmlConstructor.createElement(name);
            this._exportUtils.exportTag(processRef, 'id', ref.id, true);
            this._exportUtils.exportCaseLogic(processRef, ref.logic, 'caseLogic');
            element.appendChild(processRef);
        }
    }

    public exportTransitionRef(element: Element, ref: TransitionPermissionRef, name: string): void {
        if (ref.logic.perform !== undefined ||
            ref.logic.reassign !== undefined ||
            ref.logic.assign !== undefined ||
            ref.logic.cancel !== undefined ||
            ref.logic.viewDisabled !== undefined ||
            ref.logic.view !== undefined) {
            const transRef = this.xmlConstructor.createElement(name);
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
        model.getDataSet().sort((a, b) => a.compare(b)).forEach(data => {
            const exportData = this.xmlConstructor.createElement('data');
            exportData.setAttribute('type', data.type);
            if (data.immediate) {
                exportData.setAttribute('immediate', data.immediate.toString());
            }
            this._exportUtils.exportTag(exportData, 'id', data.id, true);
            this._exportUtils.exportI18nString(exportData, 'title', data.title, true);
            this._exportUtils.exportI18nString(exportData, 'placeholder', data.placeholder);
            this._exportUtils.exportI18nString(exportData, 'desc', data.desc);
            this.exportScope(data.scope, exportData);
            if (data.options.length > 0) {
                const options = this.xmlConstructor.createElement('options');
                data.options.forEach(opt => this._exportUtils.exportOption(options, 'option', opt));
                exportData.appendChild(options);
            }
            if (!!data.validations && (data.validations?.length ?? 0) > 0) {
                const validations = this.xmlConstructor.createElement('validations');
                data.validations?.forEach(validation => {
                    const valid = this.xmlConstructor.createElement('validation');
                    this._exportUtils.exportExpression(valid, 'expression', validation.expression);
                    this._exportUtils.exportI18nString(valid, 'message', validation.message);
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
            if (data.properties !== undefined) {
                this.exportProperties(exportData, data.properties)
            }
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
        model.getTransitions().sort((a, b) => a.compare(b)).forEach(trans => {
            const exportTrans = this.xmlConstructor.createElement('transition');
            this._exportUtils.exportTag(exportTrans, 'id', trans.id, true);
            this._exportUtils.exportTag(exportTrans, 'x', trans.x?.toString(), true);
            this._exportUtils.exportTag(exportTrans, 'y', trans.y?.toString(), true);
            this._exportUtils.exportI18nString(exportTrans, 'title', trans.title, true);
            this._exportUtils.exportTags(exportTrans, trans.properties);
            this._exportUtils.exportTag(exportTrans, 'icon', trans.icon ?? '');
            this._exportUtils.exportTag(exportTrans, 'assignPolicy', trans.assignPolicy === AssignPolicy.MANUAL ? '' : trans.assignPolicy);
            this._exportUtils.exportTag(exportTrans, 'finishPolicy', trans.finishPolicy === FinishPolicy.MANUAL ? '' : trans.finishPolicy);
            this.exportScope(trans.scope, exportTrans);
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
            this.exportTransitionContent(exportTrans, trans);
            trans.roleRefs.sort((a, b) => a.compare(b)).forEach(roleRef => {
                this.exportTransitionRef(exportTrans, roleRef, 'roleRef');
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

    public exportTransitionContent(exportTransition: Element, transition: Transition): void {
        if (transition.flex) {
            this.exportFlex(exportTransition, transition.flex);
        }
        if (transition.grid) {
            this.exportGrid(exportTransition, transition.grid);
        }
    }

    public exportFlex(exportParent: Element, flexContainer: FlexContainer): void {
        const exportFlexContainer = this.xmlConstructor.createElement('flex');

        this._exportUtils.exportTag(exportFlexContainer, 'id', flexContainer.id);
        this.exportFlexContainerProperties(exportFlexContainer, flexContainer.properties);
        flexContainer.items?.forEach(item => {
            this.exportFlexItem(exportFlexContainer, item);
        })
        exportParent.appendChild(exportFlexContainer);
    }

    public exportFlexContainerProperties(exportFlexContainer: HTMLElement, properties: FlexContainerProperties) {
        const exportFlexProperties = this.xmlConstructor.createElement('properties');

        const propertyValueMap: {
            [exportName: string]: {
                defaultValue: string | number | undefined
            }
        } = {
            'display': {
                defaultValue: FlexDisplay.FLEX.toString()
            },
            'flex-direction': {
                defaultValue: FlexDirection.ROW.toString()
            },
            'flex-wrap': {
                defaultValue: FlexWrap.NOWRAP.toString()
            },
            'flex-flow': {
                defaultValue: undefined
            },
            'justify-content': {
                defaultValue: FlexJustifyContent.FLEX_START.toString()
            },
            'align-items': {
                defaultValue: FlexAlignItems.STRETCH.toString()
            },
            'align-content': {
                defaultValue: FlexAlignContent.NORMAL.toString()
            },
            'gap': {
                defaultValue: undefined
            },
            'row-gap': {
                defaultValue: undefined
            },
            'column-gap': {
                defaultValue: FlexDirection.ROW.toString()
            }
        }

        this.processProperties(propertyValueMap, properties, exportFlexProperties);

        if (exportFlexProperties.children.length > 0) {
            exportFlexContainer.appendChild(exportFlexProperties);
        }
    }

    protected resolvePropertyExport(exportParent: Element,
                                    propertyName: string,
                                    propertyValue: string | undefined,
                                    propertyDefaultValue: string | number | undefined = undefined): boolean {
        if (this.isPropertyDefinedAndHasNondefaultValue(propertyValue, propertyDefaultValue)) {
            this._exportUtils.exportTag(exportParent, propertyName, propertyValue as string);
            return true;
        }
        return false;
    }

    protected isPropertyDefinedAndHasNondefaultValue(propertyValue: string | number | undefined, defaultPropertyValue: string | number | undefined = undefined) {
        return !!propertyValue && propertyValue !== defaultPropertyValue;
    }

    public exportFlexItem(exportFlexContainer: Element, flexItem: FlexItem): void {
        const exportFlexItem = this.xmlConstructor.createElement('item');
        if (flexItem.dataRef) {
            this.exportDataRef(exportFlexItem, flexItem.dataRef);
        }
        if (flexItem.flex) {
            this.exportFlex(exportFlexItem, flexItem.flex);
        }
        if (flexItem.grid) {
            this.exportGrid(exportFlexItem, flexItem.grid);
        }

        this.exportFlexItemProperties(exportFlexItem, flexItem.properties);
        exportFlexContainer.appendChild(exportFlexItem);
    }

    protected exportFlexItemProperties(exportFlexItem: Element, flexItemProperties: FlexItemProperties) {
        const exportFlexItemProperties = this.xmlConstructor.createElement('properties');

        const propertyValueMap: {
            [exportName: string]: {
                defaultValue: string | number | undefined
            }
        } = {
            'order': {
                defaultValue: 0
            },
            'flex-grow': {
                defaultValue: 0
            },
            'flex-shrink': {
                defaultValue: 1
            },
            'flex-basis': {
                defaultValue: 'auto'
            },
            'flex': {
                defaultValue: undefined
            },
            'align-self': {
                defaultValue: FlexItemAlignSelf.AUTO.toString()
            },
        }

        this.processProperties(propertyValueMap, flexItemProperties, exportFlexItemProperties);

        if (exportFlexItemProperties.children.length > 0) {
            exportFlexItem.appendChild(exportFlexItemProperties);
        }
    }

    public exportGrid(exportParent: Element, gridContainer: GridContainer): void {
        const exportGridContainer = this.xmlConstructor.createElement('grid');

        this._exportUtils.exportTag(exportGridContainer, 'id', gridContainer.id);
        this.exportGridContainerProperties(exportGridContainer, gridContainer.properties);
        gridContainer.items?.forEach(item => {
            this.exportGridItem(exportGridContainer, item);
        })
        exportParent.appendChild(exportGridContainer);
    }

    public exportGridContainerProperties(exportGridContainer: HTMLElement, properties: GridContainerProperties): void {
        const exportGridProperties = this.xmlConstructor.createElement('properties');

        const propertyValueMap: {
            [exportName: string]: {
                defaultValue: string | number | undefined
            }
        } = {
            'display': {
                defaultValue: GridDisplay.GRID.toString()
            },
            'grid-template-columns': {
                defaultValue: undefined
            },
            'grid-template-rows': {
                defaultValue: undefined
            },
            'grid-template-areas': {
                defaultValue: undefined
            },
            'grid-template': {
                defaultValue: undefined
            },
            'grid-column-gap': {
                defaultValue: undefined
            },
            'column-gap': {
                defaultValue: undefined
            },
            'grid-row-gap': {
                defaultValue: undefined
            },
            'row-gap': {
                defaultValue: undefined
            },
            'gap': {
                defaultValue: undefined
            },
            'grid-gap': {
                defaultValue: undefined
            },
            'justify-items': {
                defaultValue: JustifyItems.STRETCH.toString()
            },
            'align-items': {
                defaultValue: GridAlignItems.STRETCH.toString()
            },
            'place-items': {
                defaultValue: undefined
            },
            'justify-content': {
                defaultValue: GridJustifyContent.STRETCH.toString()
            },
            'align-content': {
                defaultValue: GridAlignContent.START.toString()
            },
            'place-content': {
                defaultValue: undefined
            },
            'grid-auto-columns': {
                defaultValue: undefined
            },
            'grid-auto-rows': {
                defaultValue: undefined
            },
            'grid-auto-flow': {
                defaultValue: undefined
            },
            'grid': {
                defaultValue: undefined
            },
        }

        this.processProperties(propertyValueMap, properties, exportGridProperties);
        if (exportGridProperties.children.length > 0) {
            exportGridContainer.appendChild(exportGridProperties);
        }
    }

    public exportGridItem(exportFlexContainer: Element, gridItem: GridItem) {
        const exportGridItem = this.xmlConstructor.createElement('item');
        if (gridItem.dataRef) {
            this.exportDataRef(exportGridItem, gridItem.dataRef);
        }
        if (gridItem.flex) {
            this.exportFlex(exportGridItem, gridItem.flex);
        }
        if (gridItem.grid) {
            this.exportGrid(exportGridItem, gridItem.grid);
        }

        this.exportGridItemProperties(exportGridItem, gridItem.properties);
        exportFlexContainer.appendChild(exportGridItem);
    }

    public exportGridItemProperties(exportGridItem: Element, gridItemProperties: GridItemProperties): void {
        const exportGridItemProperties = this.xmlConstructor.createElement('properties');

        const propertyValueMap: {
            [exportName: string]: {
                defaultValue: string | number | undefined
            }
        } = {
            'grid-column-start': {
                defaultValue: undefined
            },
            'grid-column-end': {
                defaultValue: undefined
            },
            'grid-row-start': {
                defaultValue: undefined
            },
            'grid-row-end': {
                defaultValue: undefined
            },
            'grid-column': {
                defaultValue: undefined
            },
            'grid-row': {
                defaultValue: undefined
            },
            'grid-area': {
                defaultValue: undefined
            },
            'justify-self': {
                defaultValue: JustifySelf.STRETCH.toString()
            },
            'align-self': {
                defaultValue: GridItemAlignSelf.STRETCH.toString()
            },
            'place-self': {
                defaultValue: undefined
            },
        }

        this.processProperties(propertyValueMap, gridItemProperties, exportGridItemProperties);

        if (exportGridItemProperties.children.length > 0) {
            exportGridItem.appendChild(exportGridItemProperties);
        }
    }

    private processProperties(
        propertyValueMap: {
            [p: string]: { defaultValue: string | number | undefined }
        },
        properties: GridContainerProperties | GridItemProperties | FlexContainerProperties | FlexItemProperties,
        exportElement: Element,
    ): void {

        for (const propertyName in propertyValueMap) {
            const values = propertyValueMap[propertyName];
            const currentValue = properties[this._exportUtils.transformKebabCaseToCamelCase(propertyName) as keyof typeof properties]?.toString();
            this.resolvePropertyExport(exportElement, propertyName, currentValue, values.defaultValue);
        }
    }

    public exportDataRef(element: Element, dataRef: DataRef): void {
        const exportDataRef = this.xmlConstructor.createElement('dataRef');
        this._exportUtils.exportTag(exportDataRef, 'id', dataRef.id, true);
        const logic = this.xmlConstructor.createElement('logic');
        if (dataRef.logic.behavior) {
            this._exportUtils.exportTag(logic, 'behavior', dataRef.logic.behavior);
        }
        if (dataRef.logic.required) {
            this._exportUtils.exportTag(logic, 'required', 'true');
        }
        if (dataRef.logic.immediate) {
            this._exportUtils.exportTag(logic, 'immediate', 'true');
        }
        exportDataRef.appendChild(logic);
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
        component.properties.forEach((value, key) => {
            this._exportUtils.exportTag(comp, 'property', value, false, [{
                key: 'key',
                value: key
            }])
        });
        element.appendChild(comp);
    }

    public exportPlaces(doc: Element, model: PetriNet): void {
        model.getPlaces().sort((a, b) => a.compare(b)).forEach(place => {
            const exportPlace = this.xmlConstructor.createElement('place');
            this._exportUtils.exportTag(exportPlace, 'id', place.id, true);
            this._exportUtils.exportTag(exportPlace, 'x', place.x?.toString(), true);
            this._exportUtils.exportTag(exportPlace, 'y', place.y?.toString(), true);
            this._exportUtils.exportI18nString(exportPlace, 'title', place.title);
            this._exportUtils.exportTag(exportPlace, 'tokens', place.marking?.toString());
            if (place.properties !== undefined) {
                this.exportProperties(exportPlace, place.properties)
            }
            this.exportScope(place.scope, exportPlace);
            doc.appendChild(exportPlace);
        });
    }

    public exportArcs(doc: Element, model: PetriNet): void {
        model.getArcs().sort((a, b) => a.compare(b)).forEach(arc => {
            const exportArc = this.xmlConstructor.createElement('arc');
            this._exportUtils.exportTag(exportArc, 'id', arc.id, true);
            this._exportUtils.exportTag(exportArc, 'type', this._exportUtils.exportArcType(arc.type));
            this._exportUtils.exportTag(exportArc, 'sourceId', arc.source.id);
            this._exportUtils.exportTag(exportArc, 'destinationId', arc.destination.id);
            this._exportUtils.exportExpression(exportArc, 'multiplicity', arc.multiplicity);
            if (arc.breakpoints !== undefined) {
                this.exportBreakpoints(exportArc, arc);
            }
            this.exportScope(arc.scope, exportArc);
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

    public alphabetically(a: string, b: string): number {
        return a.localeCompare(b);
    }

    private exportScope(scope: ResourceScope, element: HTMLElement): void {
        if (scope === ResourceScope.USECASE) {
            return;
        }
        element.setAttribute('scope', scope.toString());
    }
}
