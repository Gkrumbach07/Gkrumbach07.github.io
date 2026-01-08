
export const Footer = () => {
  const currentYear = new Date().getFullYear()

    return (
      <footer className="py-8 px-6 border-t border-border bg-background">
        <p className="font-mono text-xs text-muted-foreground text-center">
          © {currentYear} Gage Krumbach
        </p>
      </footer>
    )
}
