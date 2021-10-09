import {Action, CaseLogic, Event, Expression, I18nString, I18nWithDynamic, Logic} from '../model';

export class ExportUtils {

    private CDATA_REGRET = /<!\[CDATA\[(?:\w|\s)*]]>/g;
    private COMMENT_REGRET = /<!--(?:.|\n)*?-->/g;
    protected xmlConstructor = document.implementation.createDocument(null, 'document', null);

    constructor() {
    }

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

    public exportExpression(doc: Element, name: string, value: Expression | Array<Expression>) {
        if (value !== undefined) {
            if (!Array.isArray(value)) {
                this.exportTag(doc, name, value.expression, false, value.dynamic === true ? [{
                    key: 'dynamic',
                    value: value.dynamic.toString()
                }] : undefined);
            } else if (value.length > 0) {
                const exportInits = this.xmlConstructor.createElement('inits');
                value.forEach(init => {
                    this.exportTag(exportInits, name, init.expression, false, init.dynamic === true ? [{
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
        exportAction.insertAdjacentText('beforeend', '<!-- @formatter:off -->');
        exportAction.insertAdjacentText('beforeend', this.escapeAction(action.definition));
        exportAction.insertAdjacentText('beforeend', '<!-- @formatter:on -->');
        element.appendChild(exportAction);
    }

    public escapeAction(action: string): string {
        const cdataSections = action.match(this.CDATA_REGRET);
        const splitCdata = action.split(this.CDATA_REGRET);
        for (let i = 0; i < splitCdata.length; i++) {
            if (splitCdata[i] !== '') {
                const commentSections = splitCdata[i].match(this.COMMENT_REGRET);
                const splitComment = splitCdata[i].split(this.COMMENT_REGRET);
                for (let j = 0; j < splitComment.length; j++) {
                    if (splitComment[j] !== '') {
                        splitComment[j] = splitComment[j].replace(/&/g, '&amp;')
                            .replace(/<(?!!--)/g, '&lt;')
                            .split('').reverse().join('')
                            .replace(/>(?!(--))/g, ';tg&')
                            .split('').reverse().join('');
                    }
                }
                splitCdata[i] = this.mergeBack(commentSections, splitComment);
            }
        }
        return this.mergeBack(cdataSections, splitCdata);
    }

    private mergeBack(matches: Array<string>, splitted: Array<string>): string {
        if (matches === null) {
            return splitted.join('');
        }
        const merge = [];
        for (let j = 0; j < matches.length; j++) {
            merge.push(splitted[j]);
            merge.push(matches[j]);
        }
        merge.push(splitted[splitted.length - 1]);
        return merge.join('');
    }

    public exportLogic(element: Element, logic: Logic, type: string): void {
        const exportLogic = this.xmlConstructor.createElement(type);
        if (logic.view !== undefined) {
            this.exportTag(exportLogic, 'view', logic.view.toString());
        }
        if (logic.cancel !== undefined) {
            this.exportTag(exportLogic, 'cancel', logic.cancel.toString());
        }
        if (logic.assigned !== undefined) {
            this.exportTag(exportLogic, 'assigned', logic.assigned.toString());
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
        if (logic.view !== undefined) {
            this.exportTag(exportLogic, 'view', logic.view.toString());
        }
        if (logic.delete !== undefined) {
            this.exportTag(exportLogic, 'delete', logic.delete.toString());
        }
        if (logic.create !== undefined) {
            this.exportTag(exportLogic, 'create', logic.create.toString());
        }
        element.appendChild(exportLogic);
    }
}
