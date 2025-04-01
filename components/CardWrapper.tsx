import { Card, CardContent } from "~/components/ui/card";

interface CardWrapperProps {
  children: React.ReactNode;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({ children }) => (
  <Card className="h-[400px] bg-[#e6d5c3] border border-[#8b7355] rounded-lg">
    <CardContent className="h-full items-center justify-center">
      {children}
    </CardContent>
  </Card>
);
