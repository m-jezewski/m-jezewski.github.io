const blocks = document.querySelectorAll<HTMLElement>("[data-reveal]");

if (blocks.length > 0) {
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            }
        },
        { rootMargin: "0px 0px -12% 0px" },
    );

    blocks.forEach((block) => observer.observe(block));
}
