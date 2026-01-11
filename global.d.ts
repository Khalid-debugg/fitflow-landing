/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.css?url'

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.sass' {
  const content: { [className: string]: string }
  export default content
}
