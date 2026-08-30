import { Model, PopulateOptions } from "mongoose";

export const findOne = async ({
  model,
  filters = {},
  select = "",
  populate = [],
}: {
  model: Model<any>;
  filters?: Record<string, any>;
  select?: string;
  populate?: Record<string, any>[];
}) => {
  return await model
    .findOne(filters)
    .select(select)
    .populate(populate as PopulateOptions[]);
};

export const findById = async ({
  model,
  id,
  select = "",
  populate = [],
}: {
  model: Model<any>;
  id: string;
  select?: string;
  populate?: Record<string, any>[];
}) => {
  return await model
    .findById(id)
    .select(select)
    .populate(populate as PopulateOptions[]);
};

export const findAll = async ({
  model,
  filters = {},
  select = "",
  populate = [],
}: {
  model: Model<any>;
  filters?: Record<string, any>;
  select?: string;
  populate?: Record<string, any>[];
}) => {
  return await model
    .find(filters)
    .select(select)
    .populate(populate as PopulateOptions[]);
};

export const createOne = async ({
  model,
  data = [{}],
  options = {},
}: {
  model: Model<any>;
  data?: Record<string, any>[];
  options?: Record<string, any>;
}) => {
  return await model.create(data, options);
};

export const updateOne = async ({
  model,
  filters = {},
  data = {},
  options = { runValidators: true },
}: {
  model: Model<any>;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  options?: Record<string, any>;
}) => {
  return await model.updateOne(filters, data, options);
};
export const findAndUpdate = async ({
  model,
  filters = {},
  data = {},
  select = "",
  populate = [],
  options = { runValidators: true, returnDocument: "after" },
}: {
  model: Model<any>;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  select?: string;
  populate?: Record<string, any>[];
  options?: Record<string, any>;
}) => {
  const { $inc: dataInc, ...rest } = data;
  return await model
    .findOneAndUpdate(
      filters,
      {
        ...rest,
        $inc: { __v: 1, ...dataInc },
      },
      options,
    )
    .select(select)
    .populate(populate as PopulateOptions[]);
};

export const deleteOne = async ({
  model,
  filters = {},
}: {
  model: Model<any>;
  filters?: Record<string, any>;
}) => {
  return await model.deleteOne(filters);
};
