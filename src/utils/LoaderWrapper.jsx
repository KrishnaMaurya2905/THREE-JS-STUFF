import  { useEffect, useState } from "react";
import LoaderManager from "./LoaderManager";
import NoomoValentine from "../Components/NoomoValentine";

const LoaderWrapper = ({ data }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    LoaderManager.onProgress = setProgress;
    LoaderManager.onLoad = () => setIsLoaded(true);

    LoaderManager.load(data);
  }, [data]);

  return (
    <>
      {!isLoaded && <Loader progress={progress} />}
      {isLoaded && <NoomoValentine />}
    </>
  );
};

export default LoaderWrapper;


const Loader = ({ progress }) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center flex-col z-[9999]">
      <div className="text-white text-xl mb-4">Loading... {progress}%</div>
      <div className="w-64 h-2 bg-gray-700 rounded">
        <div
          className="bg-green-400 h-full rounded transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};


