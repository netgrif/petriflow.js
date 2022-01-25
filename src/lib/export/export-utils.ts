import {
    Action,
    CaseLogic,
    Event,
    Expression,
    I18nString,
    I18nWithDynamic,
    Logic,
    PetriflowFunction
} from '../model';

export class ExportUtils {

    protected xmlConstructor = document.implementation.createDocument(null, 'document', null);

    public exportTag(doc: Element, name: string, value: string | I18nString | I18nWithDynamic, force = false, attributes?: Array<{ key: string, value: string }>): void {
        if ((typeof value === 'string' && value !== '') ||
            (value instanceof I18nString && value.value !== undefined && value.value !== null && value.value !== '')) {
            const tag = this.xmlConstructor.createElement(name);
            if (attributes) {
                attributes.forEach(item => {
                    tag.setAttribute(item.key, item.value);
                });
            }
            if (value instanceof I18nString) {
                if (typeof value.name === 'string' && value.name !== '') {
                    tag.setAttribute('name', value.name);
                }
                if (value instanceof I18nWithDynamic && typeof value.dynamic === 'boolean' && value.dynamic) {
                    tag.setAttribute('dynamic', value.dynamic.toString());
                }
                tag.innerHTML = value.value;
            } else {
                tag.innerHTML = value;
            }
            doc.appendChild(tag);
        } else if (force) {
            const tag = this.xmlConstructor.createElement(name);
            doc.appendChild(tag);
        }
    }

    public exportExpression(doc: Element, name: string, value: Expression | Array<Expression> | undefined) {
        if (value !== undefined) {
            if (!Array.isArray(value)) {
                this.exportTag(doc, name, value.expression, false, value.dynamic ? [{
                    key: 'dynamic',
                    value: value.dynamic.toString()
                }] : undefined);
            } else if (value.length > 0) {
                const exportInits = this.xmlConstructor.createElement('inits');
                value.forEach(init => {
                    this.exportTag(exportInits, name, init.expression, false, init.dynamic ? [{
                        key: 'dynamic',
                        value: init.dynamic.toString()
                    }] : undefined);
                });
                doc.appendChild(exportInits);
            }
        }
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
        const exportAction = this.xmlConstructor.createElement('action');
        if (action.id !== undefined && action.id != null) {
            exportAction.setAttribute('id', action.id);
        }
        if (!action.definition.includes('<!-- @formatter:off -->')) {
            exportAction.insertAdjacentText('beforeend', '<!-- @formatter:off -->');
            exportAction.insertAdjacentText('beforeend', action.definition);
            exportAction.insertAdjacentText('beforeend', '<!-- @formatter:on -->');
        } else {
            exportAction.insertAdjacentText('beforeend', action.definition);
        }
        element.appendChild(exportAction);
    }

    public exportFunction(element: Element, _function: PetriflowFunction): void {
        const xmlFunction = this.xmlConstructor.createElement('function');
        xmlFunction.setAttribute('scope', _function.scope);
        xmlFunction.setAttribute('name', _function.name);
        if (!_function.definition.includes('<!-- @formatter:off -->')) {
            xmlFunction.insertAdjacentText('beforeend', '<!-- @formatter:off -->');
            xmlFunction.insertAdjacentText('beforeend', _function.definition);
            xmlFunction.insertAdjacentText('beforeend', '<!-- @formatter:on -->');
        } else {
            xmlFunction.insertAdjacentText('beforeend', _function.definition);
        }
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
        if (logic.delegate !== undefined) {
            this.exportTag(exportLogic, 'delegate', logic.delegate.toString());
        }
        if (logic.perform !== undefined) {
            this.exportTag(exportLogic, 'perform', logic.perform.toString());
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
}
