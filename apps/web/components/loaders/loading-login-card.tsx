"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function LoadingLoginCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80" />
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Social login buttons */}
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>

        {/* Divider with "or" */}
        {/* <div className="flex items-center justify-center">
          <Separator className="flex-grow" />
          <Skeleton className="h-4 w-8 mx-4" />
          <Separator className="flex-grow" />
        </div> */}

        {/* Form fields */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* Use phone link */}
        <div className="flex justify-end">
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Continue button */}
        <Skeleton className="h-14 w-full rounded-lg" />

        {/* Sign up text */}
        <div className="flex items-center justify-center space-x-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-center bg-gray-50 rounded-b-lg">
        <Skeleton className="h-4 w-36" />
      </CardFooter>
    </Card>
  );
}
