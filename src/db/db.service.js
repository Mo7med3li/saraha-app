export const findOne = async ({
  model,
  filters = {},
  select = "",
  populate = [],
} = {}) => {
  return await model.findOne(filters).select(select).populate(populate);
};

export const findAll = async ({
  model,
  filters = {},
  select = "",
  populate = [],
} = {}) => {
  return await model.find(filters).select(select).populate(populate);
};

export const createOne = async ({ model, data = [{}], options = {} }) => {
  return await model.create(data, options);
};
