import React from "react";
import logoUrl from "../assets/logo.svg";

const BrandLogo = ({ className = "w-7 h-7", title = "Score Canvas" }) => {
  return (
    <img
      src={logoUrl}
      className={className}
      alt={title}
      title={title}
      draggable={false}
    />
  );
};

export default BrandLogo;
