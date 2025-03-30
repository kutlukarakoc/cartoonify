import { Card, CardContent } from "~/components/ui/card";

export const CardWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Card className="h-5/6">
    <CardContent className="h-full items-center justify-center">
      {children}
    </CardContent>
  </Card>
);
