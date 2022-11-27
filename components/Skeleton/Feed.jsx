const SkeletonFeed = () => {
  return (
    <>
      <div className="shadow rounded-md p-4 mb-8 last:mb-0 w-full">
        <div className="animate-pulse flex space-x-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-neutral-300 h-16 w-16" />
            <div className="h-12 w-12 bg-neutral-300 rounded-full" />
            <div className="h-12 w-12 bg-neutral-300 rounded-full" />
          </div>
          <div className="w-full space-y-4 py-1">
            <div className="h-2 bg-neutral-300 rounded" />
            <div className="h-2 w-32 bg-neutral-300 rounded" />
            <div className="bg-neutral-300 h-[200px]" />
          </div>
        </div>
      </div>
      <div className="shadow rounded-md p-4 w-full">
        <div className="animate-pulse flex space-x-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-neutral-300 h-16 w-16" />
            <div className="h-12 w-12 bg-neutral-300 rounded-full" />
            <div className="h-12 w-12 bg-neutral-300 rounded-full" />
          </div>
          <div className="w-full space-y-4 py-1">
            <div className="h-2 bg-neutral-300 rounded" />
            <div className="h-2 w-32 bg-neutral-300 rounded" />
            <div className="bg-neutral-300 h-[200px]" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SkeletonFeed;
