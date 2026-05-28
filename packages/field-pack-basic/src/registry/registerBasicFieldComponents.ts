import { CheckboxFieldComponent } from "../components/CheckboxField.js";
import { DateFieldComponent } from "../components/DateField.js";
import { DividerFieldComponent } from "../components/DividerField.js";
import { EmailFieldComponent } from "../components/EmailField.js";
import { FileFieldComponent } from "../components/FileField.js";
import { HeadingFieldComponent } from "../components/HeadingField.js";
import { HiddenFieldComponent } from "../components/HiddenField.js";
import { HtmlBlockFieldComponent } from "../components/HtmlBlockField.js";
import { ImageFieldComponent } from "../components/ImageField.js";
import { LabelFieldComponent } from "../components/LabelField.js";
import { NumberFieldComponent } from "../components/NumberField.js";
import { ParagraphFieldComponent } from "../components/ParagraphField.js";
import { PasswordFieldComponent } from "../components/PasswordField.js";
import { PhoneFieldComponent } from "../components/PhoneField.js";
import { RadioFieldComponent } from "../components/RadioField.js";
import { RatingFieldComponent } from "../components/RatingField.js";
import { SelectFieldComponent } from "../components/SelectField.js";
import { SliderFieldComponent } from "../components/SliderField.js";
import { SpacerFieldComponent } from "../components/SpacerField.js";
import { SpanFieldComponent } from "../components/SpanField.js";
import { TextFieldComponent } from "../components/TextField.js";
import { TextareaFieldComponent } from "../components/TextareaField.js";
import { TimeFieldComponent } from "../components/TimeField.js";
import { UrlFieldComponent } from "../components/UrlField.js";
import type { FieldComponent } from "../types.js";
import { ReactFieldRegistry } from "./ReactFieldRegistry.js";

export const basicFieldComponentMap: Record<string, FieldComponent> = {
  text: TextFieldComponent as FieldComponent,
  textarea: TextareaFieldComponent as FieldComponent,
  email: EmailFieldComponent as FieldComponent,
  password: PasswordFieldComponent as FieldComponent,
  phone: PhoneFieldComponent as FieldComponent,
  url: UrlFieldComponent as FieldComponent,
  file: FileFieldComponent as FieldComponent,
  rating: RatingFieldComponent as FieldComponent,
  slider: SliderFieldComponent as FieldComponent,
  time: TimeFieldComponent as FieldComponent,
  number: NumberFieldComponent as FieldComponent,
  select: SelectFieldComponent as FieldComponent,
  checkbox: CheckboxFieldComponent as FieldComponent,
  radio: RadioFieldComponent as FieldComponent,
  date: DateFieldComponent as FieldComponent,
  hidden: HiddenFieldComponent as FieldComponent,
  html: HtmlBlockFieldComponent as FieldComponent,
  heading: HeadingFieldComponent as FieldComponent,
  label: LabelFieldComponent as FieldComponent,
  span: SpanFieldComponent as FieldComponent,
  image: ImageFieldComponent as FieldComponent,
  paragraph: ParagraphFieldComponent as FieldComponent,
  divider: DividerFieldComponent as FieldComponent,
  spacer: SpacerFieldComponent as FieldComponent,
};

export function registerBasicFieldComponents(
  registry: ReactFieldRegistry,
): ReactFieldRegistry {
  return registry.registerMany(basicFieldComponentMap);
}

export function createBasicReactFieldRegistry(): ReactFieldRegistry {
  const registry = new ReactFieldRegistry();
  registerBasicFieldComponents(registry);
  return registry;
}
