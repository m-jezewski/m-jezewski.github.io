type Item = {
    el: HTMLElement;
    side: string | undefined;
    start: number;
    end: number;
    mid: number;
    above: number; // title, standing on the rule
    below: number; // everything under the rule
};

const n = (value: number) => value.toFixed(2);

class ExperienceTimeline extends HTMLElement {
    private observer = new ResizeObserver(() => this.layout());
    private now = 0;

    connectedCallback() {
        // The page is static; "now" moves forward without a rebuild.
        const today = new Date();
        this.now = today.getFullYear() * 12 + today.getMonth() - Number(this.dataset.origin);
        this.style.setProperty("--now", String(this.now));

        this.observer.observe(this);
        this.querySelectorAll(".content, .title").forEach((el) => this.observer.observe(el));
    }

    disconnectedCallback() {
        this.observer.disconnect();
    }

    private layout() {
        const css = getComputedStyle(this);
        const px = (name: string) => parseFloat(css.getPropertyValue(name));
        const r = px("--brace-r");
        const stackGap = px("--stack-gap");
        const titleGap = px("--title-gap");
        const span = Number(this.dataset.span);

        const items: Item[] = Array.from(this.querySelectorAll<HTMLElement>(".entry"), (el) => {
            const start = Number(el.dataset.start);
            const end = el.dataset.end === "now" ? this.now : Number(el.dataset.end);
            return {
                el,
                side: el.dataset.side,
                start,
                end,
                mid: (start + end) / 2,
                above: (el.querySelector<HTMLElement>(".title")?.offsetHeight ?? 0) + titleGap,
                below: el.querySelector<HTMLElement>(".content")?.offsetHeight ?? 0,
            };
        });

        let ppm = px("--ppm-base");
        for (const side of ["left", "right"]) {
            const column = items.filter((i) => i.side === side).sort((a, b) => b.mid - a.mid);
            for (let k = 1; k < column.length; k++) {
                const upper = column[k - 1]!;
                const lower = column[k]!;
                ppm = Math.max(ppm, (upper.below + stackGap + lower.above) / (upper.mid - lower.mid));
            }
        }
        ppm = Number(ppm.toFixed(3));

        const beak = (i: Item) => (span - i.mid) * ppm;
        const headroom = Math.max(0, ...items.map((i) => i.above - beak(i)));
        const overhang = Math.max(0, ...items.map((i) => beak(i) + i.below - span * ppm));

        this.style.setProperty("--ppm", `${ppm}px`);
        this.style.setProperty("--headroom", `${Math.ceil(headroom)}px`);
        this.style.setProperty("--overhang", `${Math.ceil(overhang)}px`);

        for (const item of items) this.draw(item, ppm, r);
    }

    // A "}" from (0, 0) to (0, h): quarter-circle curls leave the axis, straight runs at
    // x = r, and the beak at (2r, h/2). The beak curves arrive at an angle rather than
    // flat, so the miter join gives it a real point.
    private draw(item: Item, ppm: number, radius: number) {
        const h = (item.end - item.start) * ppm;
        const w = item.el.clientWidth;
        const r = Math.min(radius, h / 4);
        const m = h / 2;

        const brace = [
            `M0 0`,
            `A${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(r)}`,
            `V${n(m - r)}`,
            `C${n(r)} ${n(m - 0.45 * r)} ${n(1.45 * r)} ${n(m - 0.25 * r)} ${n(2 * r)} ${n(m)}`,
            `C${n(1.45 * r)} ${n(m + 0.25 * r)} ${n(r)} ${n(m + 0.45 * r)} ${n(r)} ${n(m + r)}`,
            `V${n(h - r)}`,
            `A${n(r)} ${n(r)} 0 0 1 0 ${n(h)}`,
        ].join("");

        item.el.querySelectorAll('[data-path="brace"]').forEach((p) => p.setAttribute("d", brace));
        item.el.querySelector('[data-path="rule"]')?.setAttribute("d", `M${n(2 * r)} ${n(m)}H${n(w)}`);

        const gradient = item.el.querySelector("linearGradient");
        gradient?.setAttribute("x1", n(2 * r));
        gradient?.setAttribute("x2", n(2 * r + Math.min(w, 320)));
        gradient?.setAttribute("y1", n(m));
        gradient?.setAttribute("y2", n(m));

        // Split at "now": solid below it, dotted above. nowY <= 0 means it's all past.
        const nowY = "open" in item.el.dataset ? 0 : (item.end - this.now) * ppm;
        const pastTop = nowY > 0 ? nowY : -24;
        const setRect = (which: string, y: number, height: number) => {
            const rect = item.el.querySelector(`[data-clip="${which}"]`);
            rect?.setAttribute("y", n(y));
            rect?.setAttribute("height", n(Math.max(0, height)));
        };
        setRect("past", pastTop, h + 24 - pastTop);
        setRect("future", -24, nowY > 0 ? nowY + 24 : 0);
    }
}

if (!customElements.get("experience-timeline")) {
    customElements.define("experience-timeline", ExperienceTimeline);
}
