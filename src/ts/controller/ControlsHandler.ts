import { TSGo } from "./TSGo";
import { Record } from "../model/Record";


export class ControlsHandler {

    constructor(private tsgo: TSGo, options: {
        comments?: Element,
        first?: Element,
        last?: Element,
        next?: Element,
        prev?: Element,
    }) {
        this.ConfigureControls(options);
    }

    private get record(): Record {
        return this.tsgo.record;
    }

    private HandleFirst() {
        this.record.First();
    }

    private HandleLast() {
        this.record.Last();
    }

    private HandlePrevious() {
        this.record.Previous();
    }

    private HandleNext() {
        this.record.Next();
        this.tsgo.Render();
    }

    ConfigureControls(options: {
        comments?: Element,
        first?: Element,
        last?: Element,
        next?: Element,
        prev?: Element,
    }) {
        if (options.first) {
            options.first.addEventListener("click", this.HandleFirst.bind(this));
        }

        if (options.last) {
            options.last.addEventListener("click", this.HandleLast.bind(this));
        }

        if (options.prev) {
            options.prev.addEventListener("click", this.HandlePrevious.bind(this));
        }

        if (options.next) {
            options.next.addEventListener("click", this.HandleNext.bind(this));
        }
    }
}
