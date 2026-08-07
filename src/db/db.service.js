export const findOne = async ({
  model,
  filters = {},
  select = "",
  populate = [],
} = {}) => {
  return await model.findOne(filters).select(select).populate(populate);
};

export const findById = async ({
  model,
  id,
  select = "",
  populate = [],
} = {}) => {
  return await model.findById(id).select(select).populate(populate);
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

export const updateOne = async ({
  model,
  filters = {},
  data = {},
  options = { runValidators: true },
}) => {
  return await model.updateOne(filters, data, options);
};
