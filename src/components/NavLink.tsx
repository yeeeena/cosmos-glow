import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className" | "style"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  style?: (props: { isActive: boolean; isPending: boolean }) => React.CSSProperties;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, style, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          [className, isActive && activeClassName, isPending && pendingClassName].filter(Boolean).join(" ")
        }
        style={style as any}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
