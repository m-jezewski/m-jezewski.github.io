class ProjectSwitcher extends HTMLElement {
    private tabs: HTMLButtonElement[] = [];
    private panels: HTMLElement[] = [];
    private list: HTMLElement | null = null;
    private current = 0;

    connectedCallback() {
        this.tabs = Array.from(this.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        this.panels = Array.from(this.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
        this.list = this.querySelector<HTMLElement>('[role="tablist"]');

        if (this.tabs.length === 0 || this.tabs.length !== this.panels.length) return;

        this.current = Math.max(
            0,
            this.tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"),
        );

        this.list?.addEventListener("click", this.onClick);
        this.list?.addEventListener("keydown", this.onKeydown);

        this.withoutTransitions(() => this.applyDeepLink());

        this.loadMedia(this.current);
    }

    disconnectedCallback() {
        this.list?.removeEventListener("click", this.onClick);
        this.list?.removeEventListener("keydown", this.onKeydown);
    }

    private withoutTransitions(fn: () => void) {
        this.setAttribute("data-instant", "");
        fn();
        void this.offsetHeight;
        this.removeAttribute("data-instant");
    }

    private applyDeepLink() {
        const slug = window.location.hash.replace("#project-", "");
        if (!slug || slug === window.location.hash) return;

        const index = this.tabs.findIndex((tab) => tab.dataset.slug === slug);
        if (index > -1 && index !== this.current) this.select(index);
    }

    private onClick = (event: Event) => {
        const tab = (event.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]');
        if (!tab) return;

        const index = this.tabs.indexOf(tab);
        if (index > -1 && index !== this.current) this.select(index);
    };

    private onKeydown = (event: KeyboardEvent) => {
        const offsets: Record<string, number> = {
            ArrowDown: 1,
            ArrowRight: 1,
            ArrowUp: -1,
            ArrowLeft: -1,
        };

        let next: number | null = null;
        if (event.key in offsets) {
            next = (this.current + offsets[event.key]! + this.tabs.length) % this.tabs.length;
        } else if (event.key === "Home") {
            next = 0;
        } else if (event.key === "End") {
            next = this.tabs.length - 1;
        }

        if (next === null) return;
        event.preventDefault();
        this.select(next, { focus: true });
    };

    private select(index: number, options: { focus?: boolean } = {}) {
        this.current = index;

        this.tabs.forEach((tab, i) => {
            const active = i === index;
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        this.panels.forEach((panel, i) => {
            const active = i === index;
            panel.classList.toggle("is-active", active);
            panel.toggleAttribute("inert", !active);
        });

        if (options.focus) this.tabs[index]?.focus();

        this.loadMedia(index);
        this.updateHash(index);
    }

    private loadMedia(index: number) {
        const load = (i: number) => {
            const img = this.panels[i]?.querySelector<HTMLImageElement>("img[data-src]");
            if (!img?.dataset.src) return;
            img.src = img.dataset.src;
            delete img.dataset.src;
        };

        load(index);

        const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 300));
        idle(() => {
            load(index - 1);
            load(index + 1);
        });
    }

    private updateHash(index: number) {
        const slug = this.tabs[index]?.dataset.slug;
        if (!slug) return;
        history.replaceState(null, "", `#project-${slug}`);
    }
}

if (!customElements.get("project-switcher")) {
    customElements.define("project-switcher", ProjectSwitcher);
}
