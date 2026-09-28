import React from "react";

import { workExperience } from "@/data";
import { Button } from "./ui/MovingBorders";

const Experience = () => {
  return (
    <div className="py-20 w-full">
      <h2 className="heading">
        Our <span className="text-purple">expertise</span>
      </h2>

      <div className="w-full mt-12 grid lg:grid-cols-4 grid-cols-1 gap-10">
        {workExperience.map((card) => (
          <Button
            key={card.id}
            //   random duration will be fun , I think , may be not
            duration={Math.floor(Math.random() * 10000) + 10000}
            borderRadius="1.75rem"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(16,24,64,0.08)",
              borderRadius: `calc(1.75rem* 0.96)`,
            }}
            className="flex-1 text-black border-neutral-200"
          >
            <div className="flex flex-col items-center gap-3 p-3 py-6 text-center md:p-5 lg:p-8">
              <img
                src={card.thumbnail}
                alt=""
                className="h-16 w-16 object-contain lg:h-20 lg:w-20"
              />
              <div>
                <h3 className="text-center text-xl md:text-2xl font-bold">
                  {card.title}
                </h3>
                <p className="text-center text-muted-foreground mt-3 font-semibold">
                  {card.desc}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Experience;
