export default class NotificationMessage {
    constructor(label, {duration=0, type=""} ={}) {
        this.label = label
        this.type = type
        this.duration = duration
        this.render(); 
    }

    render() {
        const div = document.createElement("div");
        div.innerHTML = 
            `<div class="notification ${this.type}" style="--value:${this.duration}s">
                <div class="timer"></div>
                    <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.label}
                    </div>
                </div>
            </div>`;
        this.element = div.firstElementChild;
    }

    show(parent = document.body) {
        parent.append(this.element);
        this.removeAfterShow();
    }
    removeAfterShow() {
        setTimeout(()=> {
            this.remove();
        }, this.duration)
    }

    destroy() {
        this.remove();
        this.element = null;
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }
}
