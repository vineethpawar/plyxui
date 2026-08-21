// Native barrel. Mirrors the web exports so consumers can flip platforms
// without changing imports; hooks that touch platform APIs (useReducedMotion)
// swap in their .native implementation here. Metro consumers resolving from
// src get the same result via platform extensions.
export { useDisclosure } from "./useDisclosure";
export type { UseDisclosureReturn } from "./useDisclosure";

export { useClickOutside } from "./useClickOutside";

export { useMediaQuery } from "./useMediaQuery";

export { useReducedMotion } from "./useReducedMotion.native";

export { useToast, ToastProvider } from "./useToast";
export type { ToastItem, ToastAction, ToastVariant, ToastContextValue } from "./useToast";
