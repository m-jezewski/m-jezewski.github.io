class MediaCarousel extends HTMLElement {
    private track: HTMLElement | null = null;
    private dots: HTMLButtonElement[] = [];
    private prev: HTMLButtonElement | null = null;
    private next: HTMLButtonElement | null = null;
    private count = 0;
    private frame = 0;

    connectedCallback() {
        this.track = this.querySelector<HTMLElement>("[data-track]");
        this.count = this.querySelectorAll("[data-slide]").length;
        if (!this.track || this.count < 2) return;

        this.dots = Array.from(this.querySelectorAll<HTMLButtonElement>("[data-dot]"));
        this.prev = this.querySelector<HTMLButtonElement>("[data-prev]");
        this.next = this.querySelector<HTMLButtonElement>("[data-next]");

        this.track.addEventListener("scroll", this.onScroll, { passive: true });
        this.addEventListener("click", this.onClick);
        this.sync();
    }

    disconnectedCallback() {
        this.track?.removeEventListener("scroll", this.onScroll);
        this.removeEventListener("click", this.onClick);
        cancelAnimationFrame(this.frame);
    }

    private get index() {
        const track = this.track!;
        return Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    }

    private go(index: number) {
        const track = this.track!;
        const target = Math.max(0, Math.min(this.count - 1, index));
        const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
        track.scrollTo({ left: target * track.clientWidth, behavior: smooth ? "smooth" : "auto" });
    }

    private onClick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-prev]")) this.go(this.index - 1);
        else if (target.closest("[data-next]")) this.go(this.index + 1);
        else {
            const dot = target.closest<HTMLButtonElement>("[data-dot]");
            if (dot) this.go(Number(dot.dataset.dot));
        }
    };

    private onScroll = () => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.sync());
    };

    private sync() {
        const index = this.index;
        this.dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
        if (this.prev) this.prev.disabled = index === 0;
        if (this.next) this.next.disabled = index === this.count - 1;
    }
}

if (!customElements.get("media-carousel")) {
    customElements.define("media-carousel", MediaCarousel);
}
