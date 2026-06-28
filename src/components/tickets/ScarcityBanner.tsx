interface ScarcityBannerProps {
  percent: number;
  message?: string;
}

export function ScarcityBanner({ percent, message }: ScarcityBannerProps) {
  return (
    <div className="border-b border-pink-200 bg-pink-50 px-4 py-2 text-center text-sm font-medium text-pink-800">
      {message ?? `Only ${percent}% of tickets left`}
    </div>
  );
}
