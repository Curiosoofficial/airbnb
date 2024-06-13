import CreationBottomBar from "@/components/CreationBottomBar";
import SelectCategory from "@/components/SelectCategory";

import { createCategoryPage } from "@/lib/actions/actions";


const page = ({params}: {params: {id: string}}) => {
  return (
    <>
      <div className="w-3/5 mx-auto">
        <h2 className="text-3xl max-lg:text-xl font-semibold tracking-tight transition-colors">
          Which of these best describes your Home?
        </h2>
      </div>

      <form action={createCategoryPage}>
        <input type="hidden" name="homeId" value={params.id} />
        <SelectCategory />

        <CreationBottomBar />
      </form>
    </>
  );
};

export default page;
