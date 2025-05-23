// C:\Users\hanos\nextall\backend\src\controllers\category.js

const User = require('../models/User');
const Categories = require('../models/Category');
const SubCategories = require('../models/SubCategory');
const { singleFileDelete } = require('../config/uploader');
const getBlurDataURL = require('../config/getBlurDataURL');

const createCategory = async (req, res) => {
  try {
    const { cover, ...others } = req.body;
    // Validate if the 'blurDataURL' property exists in the logo object

    // If blurDataURL is not provided, generate it using the 'getBlurDataURL' function
    const blurDataURL = await getBlurDataURL(cover.url);

    await Categories.create({
      ...others,
      cover: {
        ...cover,
        blurDataURL,
      },
    });

    res.status(201).json({ success: true, message: 'Category Created' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllHeaderCategories = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    await SubCategories.findOne();
    const categories = await Categories.find()
      .sort({
        createdAt: -1,
      })
      .select(['name', 'slug', 'subCategories'])
      .populate({ path: 'subCategories', select: ['name', 'slug'] });

    res.status(201).json({
      success: true,
      data: categories,
      ...(!userCount && {
        adminPopup: true,
      }),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getAllCategories = async (req, res) => {
  try {
    await SubCategories.findOne();
    const categories = await Categories.find()
      .sort({
        createdAt: -1,
      })
      .select(['name', 'slug'])
      .populate({ path: 'subCategories', select: ['name', 'slug'] });


    res.status(201).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCategoriesByAdmin = async (req, res) => {
  try {
    const categories = await Categories.find()
      .sort({
        createdAt: -1,
      })
      .select(['name', 'slug']);

    res.status(201).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCategoryByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Categories.findOne({ slug });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category Not Found',
      });
    }

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Categories.findOne({ slug }).select([
      'name',
      'description',
      'metaTitle',
      'metaDescription',
      'cover',
      'slug',
    ]);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category Not Found',
      });
    }

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const updateCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { cover, ...others } = req.body;
    // Validate if the 'blurDataURL' property exists in the logo object
    if (!cover.blurDataURL) {
      // If blurDataURL is not provided, generate it using the 'getBlurDataURL' function
      cover.blurDataURL = await getBlurDataURL(cover.url);
    }
    await Categories.findOneAndUpdate(
      { slug },
      {
        ...others,
        cover: {
          ...cover,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(201).json({ success: true, message: 'Category Updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Categories.findOneAndDelete({ slug });
    const dataaa = await singleFileDelete(category.cover._id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category Not Found',
      });
    }

    res
      .status(201)
      .json({ success: true, message: 'Category Deleted Successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getCategories = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = '' } = req.query;

    const skip = parseInt(limit) || 10;
    const totalCategories = await Categories.find({
      name: { $regex: search, $options: 'i' },
    });
    const categories = await Categories.find(
      {
        name: { $regex: search, $options: 'i' },
      },
      null,
      {
        skip: skip * (parseInt(page) - 1 || 0),
        limit: skip,
      }
    ).sort({
      createdAt: -1,
    });

    res.status(201).json({
      success: true,
      data: categories,
      count: Math.ceil(totalCategories.length / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getCategoriesSlugs = async (req, res) => {
  try {
    const categories = await Categories.find().select('slug');

    res.status(201).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getSubCategoriesSlugs = async (req, res) => {
  try {
    const categories = await SubCategories.find()
      .select('slug')
      .populate({ path: 'parentCategory', select: ['slug'] });

    res.status(201).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getCategoryNameBySlug = async (req, res) => {
  try {
    const category = await Categories.findOne({
      slug: req.params.slug,
    }).select(['name', 'slug']);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
  createCategory,
  getCategories,
  getAllHeaderCategories,
  getCategoryBySlug,
  updateCategoryBySlug,
  deleteCategoryBySlug,
  getCategoriesSlugs,
  getSubCategoriesSlugs,
  getCategoryByAdmin,
  getCategoryNameBySlug,
  getAllCategories,
  getCategoriesByAdmin,
};
