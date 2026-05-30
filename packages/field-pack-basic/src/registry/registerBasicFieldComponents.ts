import { CheckboxFieldComponent } from "../components/CheckboxField.js";
import { CheckboxGroupFieldComponent } from "../components/CheckboxGroupField.js";
import { ColorFieldComponent } from "../components/ColorField.js";
import { CountdownFieldComponent } from "../components/CountdownField.js";
import { DateFieldComponent } from "../components/DateField.js";
import { DividerFieldComponent } from "../components/DividerField.js";
import { EmailFieldComponent } from "../components/EmailField.js";
import { FileFieldComponent } from "../components/FileField.js";
import { GdprFieldComponent } from "../components/GdprField.js";
import { HeadingFieldComponent } from "../components/HeadingField.js";
import { HiddenFieldComponent } from "../components/HiddenField.js";
import { HtmlBlockFieldComponent } from "../components/HtmlBlockField.js";
import { ImageFieldComponent } from "../components/ImageField.js";
import { LabelFieldComponent } from "../components/LabelField.js";
import { MatrixFieldComponent } from "../components/MatrixField.js";
import { NumberFieldComponent } from "../components/NumberField.js";
import { ParagraphFieldComponent } from "../components/ParagraphField.js";
import { PasswordFieldComponent } from "../components/PasswordField.js";
import { PdfFieldComponent } from "../components/PdfField.js";
import { PhoneFieldComponent } from "../components/PhoneField.js";
import { PhotoFieldComponent } from "../components/PhotoField.js";
import { RadioFieldComponent } from "../components/RadioField.js";
import { RatingFieldComponent } from "../components/RatingField.js";
import { RecaptchaFieldComponent } from "../components/RecaptchaField.js";
import { ScaleFieldComponent } from "../components/ScaleField.js";
import { SelectFieldComponent } from "../components/SelectField.js";
import { SignatureFieldComponent } from "../components/SignatureField.js";
import { SliderFieldComponent } from "../components/SliderField.js";
import { SpacerFieldComponent } from "../components/SpacerField.js";
import { SpanFieldComponent } from "../components/SpanField.js";
import { TextFieldComponent } from "../components/TextField.js";
import { TextareaFieldComponent } from "../components/TextareaField.js";
import { TimeFieldComponent } from "../components/TimeField.js";
import { UrlFieldComponent } from "../components/UrlField.js";
import { VoiceFieldComponent } from "../components/VoiceField.js";
import { YoutubeFieldComponent } from "../components/YoutubeField.js";
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
  checkboxGroup: CheckboxGroupFieldComponent as FieldComponent,
  radio: RadioFieldComponent as FieldComponent,
  signature: SignatureFieldComponent as FieldComponent,
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
  color: ColorFieldComponent as FieldComponent,
  scale: ScaleFieldComponent as FieldComponent,
  photo: PhotoFieldComponent as FieldComponent,
  voice: VoiceFieldComponent as FieldComponent,
  gdpr: GdprFieldComponent as FieldComponent,
  youtube: YoutubeFieldComponent as FieldComponent,
  pdf: PdfFieldComponent as FieldComponent,
  countdown: CountdownFieldComponent as FieldComponent,
  matrix: MatrixFieldComponent as FieldComponent,
  recaptcha: RecaptchaFieldComponent as FieldComponent,
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
