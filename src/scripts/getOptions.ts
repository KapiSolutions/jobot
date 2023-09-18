import input from "@inquirer/input";

// Get scrapper options from the console input
const getOptions = async () => {
  const searchValue: string = await input({
    message: "Please enter the search value for the job:",
    validate: (input) => {
      if (input !== "") {
        return true;
      }
      return "This field is required.";
    },
  });

  const maxRecords: string = await input({
    message: "Please specify the number of jobs to show: ",
    validate: (input) => {
      const number = parseInt(input);
      if (!isNaN(number) && number > 0) {
        return true;
      }
      return "Please enter a positive number.";
    },
  });

  return { searchValue: searchValue, maxRecords: parseInt(maxRecords) };
};

export default getOptions;
