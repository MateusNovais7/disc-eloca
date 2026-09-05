interface ElocaLogoProps {
  variant?: "dark" | "light";
  className?: string;
}

/**
 * Logo oficial da Eloca (arquivo real fornecido pela empresa, não recriado).
 * variant="dark": cor original (navy) — usar em fundos claros.
 * variant="light": aplica filtro CSS para renderizar em branco — usar em
 * fundos escuros (navy), já que só temos o arquivo original em navy.
 */
export function EloceLogo({ variant = "dark", className = "h-7 w-auto" }: ElocaLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/eloca-logo.png"
      alt="Eloca"
      className={className}
      style={variant === "light" ? { filter: "brightness(0) invert(1)" } : undefined}
    />
  );
}
