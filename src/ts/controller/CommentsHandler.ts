import { TSGo } from "./TSGo";
import { Record } from "../model/Record";


export class CommentsHandler {

    constructor(private tsgo: TSGo, private comments?: Element) { }

    private get record(): Record {
        return this.tsgo.record;
    }

    SetComments() {
        if (this.comments) {
            const comments = this.record.current.info.comment;
            if (!comments) return;
            const parts = comments.split(/\r\n|\r|\n/gi);
            let text = "";
            for (const comment of parts) {
                text += `<p>${comment}</p>`;
            }
            this.comments.innerHTML = text;
        }
    }

}
