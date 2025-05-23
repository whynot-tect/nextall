const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    code: {
      type: String,
    },
    status: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: 'Brand',
    },
    likes: {
      type: Number,
    },
    description: {
      type: String,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'Category',
      required: [true, 'please provide a category id'],
    },
    subCategory: {
      type: mongoose.Types.ObjectId,
      ref: 'SubCategory',
      required: [true, 'please provide a sub category id'],
    },
    gender: {
      type: String,
    },
    tags: [String],
    sku: {
      type: String,
      required: [true, 'SKU is required.'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
    },
    priceSale: {
      type: Number,
      required: [true, 'Sale price is required.'],
    },
    oldPriceSale: {
      type: Number,
    },
    available: {
      type: Number,
      required: [true, 'Available quantity is required.'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'ProductReview',
      },
    ],

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: [true],
        },
        _id: {
          type: String,
          required: [true],
        },
        blurDataURL: {
          type: String,
          required: [true, 'image-blur-data-url-required-error'],
        },
      },
    ],

    colors: [String],
    sizes: [String],
  },
  { timestamps: true, strict: true }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
module.exports = Product;
