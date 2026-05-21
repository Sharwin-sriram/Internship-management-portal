import Industry from "../models/Industry.js";

const DEFAULT_INDUSTRIES = [
  "Information Technology",
  "Software Development",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "FinTech",
  "EdTech",
  "Healthcare",
  "Biotechnology",
  "Pharmaceuticals",
  "E-commerce",
  "Retail",
  "Manufacturing",
  "Automotive",
  "Aerospace",
  "Telecommunications",
  "Consulting",
  "Marketing",
  "Media and Entertainment",
  "Design",
  "Construction",
  "Energy",
  "Agriculture",
  "Hospitality",
  "Logistics",
  "Government",
  "Non-Profit",
];

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const seedDefaultIndustries = async () => {
  const count = await Industry.countDocuments();
  if (count > 0) return;

  const docs = DEFAULT_INDUSTRIES.map((name, index) => ({
    name,
    slug: slugify(name),
    sort_order: index + 1,
    is_active: true,
  }));

  await Industry.insertMany(docs, { ordered: false });
};

export const getIndustries = async (_req, res) => {
  try {
    const industries = await Industry.find({ is_active: true }).sort({
      sort_order: 1,
      name: 1,
    });
    res
      .status(200)
      .json({ success: true, count: industries.length, data: industries });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch industries." });
  }
};

export const createIndustry = async (req, res) => {
  try {
    const { name, sort_order, is_active } = req.body;
    if (!name || !String(name).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Industry name is required." });
    }

    const slug = slugify(name);
    const existing = await Industry.findOne({ slug });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Industry already exists." });
    }

    const industry = await Industry.create({
      name: String(name).trim(),
      slug,
      sort_order: Number(sort_order) || 0,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    res.status(201).json({ success: true, data: industry });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to create industry." });
  }
};

export const updateIndustry = async (req, res) => {
  try {
    const update = {};
    if (req.body.name !== undefined) {
      const nextName = String(req.body.name).trim();
      if (!nextName) {
        return res
          .status(400)
          .json({ success: false, message: "Industry name is required." });
      }
      update.name = nextName;
      update.slug = slugify(nextName);
    }
    if (req.body.sort_order !== undefined)
      update.sort_order = Number(req.body.sort_order) || 0;
    if (req.body.is_active !== undefined)
      update.is_active = Boolean(req.body.is_active);

    const industry = await Industry.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!industry) {
      return res
        .status(404)
        .json({ success: false, message: "Industry not found." });
    }

    res.status(200).json({ success: true, data: industry });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to update industry." });
  }
};

export const deleteIndustry = async (req, res) => {
  try {
    const industry = await Industry.findByIdAndDelete(req.params.id);
    if (!industry) {
      return res
        .status(404)
        .json({ success: false, message: "Industry not found." });
    }

    res.status(200).json({ success: true, message: "Industry deleted." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to delete industry." });
  }
};
