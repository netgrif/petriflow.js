import {
    Action, Arc,
    ArcType,
    CaseLogic,
    Event,
    Expression,
    I18nString,
    I18nWithDynamic,
    Logic,
    PetriflowFunction,
    XmlArcType
} from '../model';

export class ExportUtils {

    protected xmlConstructor = document.implementation.createDocument(null, 'document', null);

    public exportTag(doc: Element, name: string, value: string | I18nString | I18nWithDynamic, force = false, attributes?: Array<{
        key: string,
        value: string
    }>): void {
        if ((typeof value === 'string' && value !== '') ||
            (value instanceof I18nString && value.value !== undefined && value.value !== null && value.value !== '')) {
            const tag = this.xmlConstructor.createElement(name);
            if (attributes) {
                attributes.forEach(item => {
                    tag.setAttribute(item.key, item.value);
                });
            }
            if (value instanceof I18nString) {
                if (typeof value.id === 'string' && value.id !== '') {
                    tag.setAttribute('id', value.id);
                }
                if (value instanceof I18nWithDynamic && typeof value.dynamic === 'boolean' && value.dynamic) {
                    tag.setAttribute('dynamic', value.dynamic.toString());
                }
                tag.textContent = value.value;
            } else {
                if (/<\/?[a-z][\s\S]*>/.test(value)) {
                    tag.innerHTML = `<![CDATA[${value?.trim()}]]>`;
                } else {
                    tag.textContent = value;
                }
            }
            doc.appendChild(tag);
        } else if (force) {
            const tag = this.xmlConstructor.createElement(name);
            doc.appendChild(tag);
        }
    }

    public exportExpression(doc: Element, name: string, value: Expression | undefined) {
        if (value === undefined) {
            return;
        }
        this.exportTag(doc, name, value.expression, false, value.dynamic ? [{
            key: 'dynamic',
            value: value.dynamic.toString()
        }] : undefined);
    }

    public exportI18nWithDynamic(doc: Element, name: string, value: I18nWithDynamic | undefined) {
        if (value === undefined) {
            return;
        }
        const attributes = [];
        if (value.dynamic) {
            attributes.push({
                key: 'dynamic',
                value: value.dynamic.toString()
            })
        }
        if (value.id) {
            attributes.push({
                key: 'id',
                value: value.id
            })
        }
        this.exportTag(doc, name, value.value, false, attributes);
    }

    public exportActions<T>(element: Element, event: Event<T>, phase: string): void {
        const actions = this.xmlConstructor.createElement('actions');
        actions.setAttribute('phase', phase);
        if (phase === 'pre') {
            event.preActions.forEach(action => {
                this.exportAction(actions, action);
            });
        } else {
            event.postActions.forEach(action => {
                this.exportAction(actions, action);
            });
        }
        element.appendChild(actions);
    }

    public exportAction(element: Element, action: Action): void {
        if (action.definition === undefined || action.definition.trim().length === 0) {
            return;
        }
        const exportAction = this.xmlConstructor.createElement('action');
        if (action.id !== undefined && action.id != null) {
            exportAction.setAttribute('id', action.id);
        }
        exportAction.insertAdjacentText('beforeend', action.definition);
        element.appendChild(exportAction);
    }

    public exportFunction(element: Element, _function: PetriflowFunction): void {
        const xmlFunction = this.xmlConstructor.createElement('function');
        xmlFunction.setAttribute('scope', _function.scope);
        xmlFunction.setAttribute('name', _function.name);
        xmlFunction.insertAdjacentText('beforeend', _function.definition);
        element.appendChild(xmlFunction);
    }

    public exportLogic(element: Element, logic: Logic, type: string): void {
        const exportLogic = this.xmlConstructor.createElement(type);
        if (logic.view !== undefined) {
            this.exportTag(exportLogic, 'view', logic.view.toString());
        }
        if (logic.cancel !== undefined) {
            this.exportTag(exportLogic, 'cancel', logic.cancel.toString());
        }
        if (logic.assign !== undefined) {
            this.exportTag(exportLogic, 'assign', logic.assign.toString());
        }
        if (logic.reassign !== undefined) {
            this.exportTag(exportLogic, 'reassign', logic.reassign.toString());
        }
        if (logic.perform !== undefined) {
            this.exportTag(exportLogic, 'perform', logic.perform.toString());
        }
        if (logic.viewDisabled !== undefined) {
            this.exportTag(exportLogic, 'view_disabled', logic.viewDisabled.toString());
        }
        element.appendChild(exportLogic);
    }

    public exportCaseLogic(element: Element, logic: CaseLogic, type: string): void {
        const exportLogic = this.xmlConstructor.createElement(type);
        if (logic.create !== undefined) {
            this.exportTag(exportLogic, 'create', logic.create.toString());
        }
        if (logic.delete !== undefined) {
            this.exportTag(exportLogic, 'delete', logic.delete.toString());
        }
        if (logic.view !== undefined) {
            this.exportTag(exportLogic, 'view', logic.view.toString());
        }
        element.appendChild(exportLogic);
    }

    public exportArcType(type: ArcType): XmlArcType {
        const xmlType = Arc.arcTypeMapping.get(type);
        if (!xmlType) {
            throw new Error(`Unknown export mapping for arc type ${type}`);
        }
        return xmlType;
    }
}
