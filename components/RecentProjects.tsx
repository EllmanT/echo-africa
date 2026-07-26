"use client";

import { FaLocationArrow } from "react-icons/fa6";

import { projects } from "@/data";
import { PinContainer } from "./ui/Pin";

const RecentProjects = () => {
  return (
    <div className="py-20  border-r rounded-2xl" id="projects">
      <h1 className="heading">
        A small selection of{" "}
        <span className="text-purple">recent projects</span>
      </h1>
      <div className="flex flex-wrap items-center justify-center p-4 gap-16 mt-10">
        {projects.map((item) => (
          <a key={item.id} href={item.link} target="_blank">
            <div
              className="lg:min-h-[32.5rem] h-[25rem] flex items-center justify-center sm:w-96 w-[80vw]"
              key={item.id}
            >
              <PinContainer title={item.title} href={item.link}>
                <div className="relative flex items-center justify-center sm:w-96 w-[80vw] overflow-hidden h-[20vh] lg:h-[30vh] mb-10">
                  <div
                    className="absolute inset-0 lg:rounded-3xl bg-muted"
                  >
                    <img src="/bg.png" alt="bgimg" className="w-full h-full object-cover" />
                  </div>
                  <img
                    src={item.img}
                    alt="cover"
                    className="z-10 absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <h1 className="font-bold lg:text-2xl md:text-xl text-base line-clamp-1">
                  {item.title}
                </h1>

                <p
                  className="lg:text-xl lg:font-normal font-light text-sm line-clamp-2 text-muted-foreground"
                  style={{ margin: "1vh 0" }}
                >
                  {item.des}
                </p>

                {!item.link.startsWith("mailto:") && (
                  <div className="flex items-center justify-end mt-7 mb-3">
                    <div className="flex justify-center items-center">
                      <p className="flex lg:text-xl md:text-xs text-sm text-purple">
                        Check Live Site
                      </p>
                      <FaLocationArrow className="ms-3" color="#7C3AED" />
                    </div>
                  </div>
                )}
              </PinContainer>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;
