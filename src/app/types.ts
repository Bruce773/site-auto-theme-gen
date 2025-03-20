// types.ts
export interface BaseTheme {
  rounding: 'none' | 'small' | 'medium' | 'large';
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  backgroundColor: string;
  mainHeaderSize: string;
}

export interface ExampleText {
  header: string;
}

export interface ExampleImages {
  pageBackground: string;
  smallHeaderCompanion: string;
}

export interface HtmlStructure {
  header?: string;
  mainContent?: string;
  footer?: string;
}
