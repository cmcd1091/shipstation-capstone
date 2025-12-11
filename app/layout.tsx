import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "ShipStation Capstone",
  description: "Order processing and PNG automation tool",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
