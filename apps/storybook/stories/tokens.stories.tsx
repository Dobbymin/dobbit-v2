import type { Meta, StoryObj } from "@storybook/react-vite";

const NEUTRAL = [50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950];
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const BRAND: { name: string; label: string }[] = [
  { name: "lime", label: "lime (brand)" },
  { name: "up", label: "up (등락 상승)" },
  { name: "down", label: "down (등락 하락)" },
  { name: "pos", label: "pos (손익 +)" },
  { name: "neg", label: "neg (손익 −)" },
];
const SEMANTIC = [
  "background",
  "foreground",
  "card",
  "popover",
  "primary",
  "primary-foreground",
  "secondary",
  "muted",
  "muted-foreground",
  "accent",
  "destructive",
  "border",
  "increase",
  "decrease",
  "positive",
  "negative",
];
const RADII = ["sm", "md", "lg", "xl"];

function Swatch({ varName, label }: { varName: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="border-border h-12 w-full rounded-md border"
        style={{ background: `var(${varName})` }}
      />
      <span className="text-muted-foreground text-[11px]">{label}</span>
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      <div className="grid grid-cols-6 gap-3 sm:grid-cols-10">{children}</div>
    </section>
  );
}

const meta = {
  title: "Design Tokens/Overview",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-foreground text-lg font-bold">@dobbit/ui — Design Tokens</h2>
        <p className="text-muted-foreground text-sm">
          Base(OKLCH 50~900) → Semantic 2계층. 우측 상단 테마 툴바로 다크/라이트 전환.
        </p>
      </div>

      <Row title="Base · neutral">
        {NEUTRAL.map((s) => (
          <Swatch key={s} varName={`--neutral-${s}`} label={`neutral-${s}`} />
        ))}
      </Row>

      {BRAND.map(({ name, label }) => (
        <Row key={name} title={`Base · ${label}`}>
          {STEPS.map((s) => (
            <Swatch key={s} varName={`--${name}-${s}`} label={`${name}-${s}`} />
          ))}
        </Row>
      ))}

      <Row title="Semantic">
        {SEMANTIC.map((s) => (
          <Swatch key={s} varName={`--${s}`} label={s} />
        ))}
      </Row>

      <section className="flex flex-col gap-3">
        <h3 className="text-foreground text-sm font-semibold">Radius</h3>
        <div className="flex flex-wrap gap-6">
          {RADII.map((r) => (
            <div key={r} className="flex flex-col items-center gap-1">
              <div
                className="bg-primary/30 border-primary h-16 w-16 border"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <span className="text-muted-foreground text-[11px]">radius-{r}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
