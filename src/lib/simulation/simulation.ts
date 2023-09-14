import {Arc, ArcType, NodeElement, PetriNet, Transition} from "../model";

export abstract class Simulation {

    static readonly ARC_ORDER = [
        ArcType.INHIBITOR,
        ArcType.READ,
        ArcType.REGULAR_PT,
        ArcType.REGULAR_TP,
        ArcType.RESET
    ];

    private readonly _originalModel: PetriNet;
    private _simulationModel: PetriNet;
    private _inputArcs: Map<string, Array<Arc<NodeElement, NodeElement>>>;
    private _outputArcs: Map<string, Array<Arc<NodeElement, NodeElement>>>;
    private _assignedTasks: Set<string>;
    private _consumedTokens: Map<string, number>;

    public constructor(model: PetriNet) {
        if (!model) {
            throw new Error('Model can not be undefined');
        }
        this._originalModel = model.clone();
        this._simulationModel = model.clone();
        // noinspection DuplicatedCode due to TS2564: Property has no initializer and is not definitely assigned in the constructor.
        this._inputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this._outputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this._assignedTasks = new Set<string>();
        this._consumedTokens = new Map<string, number>();
    }

    public fire(transitionId: string): void {
        this.assign(transitionId);
        this.finish(transitionId);
    }

    public abstract assign(transitionId: string): void;

    public abstract finish(transitionId: string): void;

    public abstract cancel(transitionId: string): void;

    public abstract isEnabled(transitionId: string): boolean

    public abstract enabled(): Array<Transition>;

    public abstract isAssigned(transitionId: string): boolean;

    public abstract assigned(): Array<Transition>;

    public reset(): void {
        this._simulationModel = this.originalModel.clone();
        // noinspection DuplicatedCode due to TS2564: Property has no initializer and is not definitely assigned in the constructor.
        this._inputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this._outputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this._assignedTasks = new Set<string>();
        this._consumedTokens = new Map<string, number>();
    }

    public get simulationModel(): PetriNet {
        return this._simulationModel;
    }

    public get originalModel(): PetriNet {
        return this._originalModel;
    }


    get inputArcs(): Map<string, Array<Arc<NodeElement, NodeElement>>> {
        return this._inputArcs;
    }

    get outputArcs(): Map<string, Array<Arc<NodeElement, NodeElement>>> {
        return this._outputArcs;
    }

    get assignedTasks(): Set<string> {
        return this._assignedTasks;
    }

    get consumedTokens(): Map<string, number> {
        return this._consumedTokens;
    }
}
