type State = "sending" | "sent" | "error";

const MESSAGES: Record<State, string> = {
    sending: "Sending…",
    sent: "Thanks — your message is on its way.",
    error: "Something went wrong. You can also reach me at the address above.",
};

class ContactForm extends HTMLElement {
    private form: HTMLFormElement | null = null;
    private status: HTMLElement | null = null;
    private button: HTMLButtonElement | null = null;
    private buttonLabel = "";

    connectedCallback() {
        this.form = this.querySelector("form");
        this.status = this.querySelector(".js-status");
        this.button = this.querySelector<HTMLButtonElement>('button[type="submit"]');
        this.buttonLabel = this.button?.textContent ?? "Send";

        this.form?.addEventListener("submit", this.onSubmit);
    }

    disconnectedCallback() {
        this.form?.removeEventListener("submit", this.onSubmit);
    }

    private onSubmit = async (event: SubmitEvent) => {
        if (!this.form) return;
        event.preventDefault();

        this.setState("sending");

        try {
            const response = await fetch(this.form.action, {
                method: "POST",
                body: new FormData(this.form),
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                this.form.reset();
                this.setState("sent");
                return;
            }

            const body = await response.json().catch(() => null);
            this.setState("error", body?.errors?.[0]?.message);
        } catch {
            this.setState("error");
        }
    };

    private setState(state: State, message?: string) {
        this.dataset.state = state;

        if (this.status) this.status.textContent = message ?? MESSAGES[state];

        if (this.button) {
            const sending = state === "sending";
            this.button.disabled = sending;
            this.button.textContent = sending ? "Sending…" : this.buttonLabel;
        }
    }
}

if (!customElements.get("contact-form")) {
    customElements.define("contact-form", ContactForm);
}
