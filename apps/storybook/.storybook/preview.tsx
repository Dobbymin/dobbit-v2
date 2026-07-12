import { withThemeByClassName } from "@storybook/addon-themes";

import type { Preview } from "@storybook/react-vite";

import "./tailwind.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      // 앱은 다크가 기본(:root). 라이트는 `.light` 클래스로 토글.
      themes: {
        dark: "",
        light: "light",
      },
      defaultTheme: "dark",
    }),
    (Story) => (
      <div className="bg-background text-foreground min-h-screen p-8">
        <Story />
      </div>
    ),
  ],
};

export default preview;
