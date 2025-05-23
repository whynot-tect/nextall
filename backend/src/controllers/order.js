// C:\Users\hanos\nextall\backend\src\controllers\order.js 

const Notifications = require('../models/Notification');
const Products = require('../models/Product');
const Orders = require('../models/Order');
const Coupons = require('../models/CouponCode');
const User = require('../models/User');
const Shop = require('../models/Shop');
const fs = require('fs');
const path = require('path');
const postmark = require("postmark"); // Replaced nodemailer with postmark
const { getVendor, getAdmin } = require('../config/getUser');

const postmarkClient = new postmark.ServerClient(
  process.env.POSTMARK_SERVER_TOKEN || "2214dcca-9d7f-4fb9-8cbb-1f16c216d10b"
);

function isExpired(expirationDate) {
  const currentDateTime = new Date();
  return currentDateTime >= new Date(expirationDate);
}

function generateOrderNumber() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let orderNumber = '';

  // Generate a random alphabet character
  orderNumber += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

  // Generate 6 random digits
  for (let i = 0; i < 6; i++) {
    orderNumber += Math.floor(Math.random() * 10);
  }

  return orderNumber;
}

function readHTMLTemplate() {
  const htmlFilePath = path.join(
    process.cwd(),
    'src/email-templates',
    'order.html'
  );
  return fs.readFileSync(htmlFilePath, 'utf8');
}

const createOrder = async (req, res) => {
  try {
    const {
      items,
      user,
      currency,
      conversionRate,
      paymentMethod,
      paymentId,
      couponCode,
      totalItems,
      shipping,
      description,
    } = req.body;

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Please Provide Item(s)' });
    }

    const products = await Products.find({
      _id: { $in: items.map((item) => item.pid) },
    });

    const updatedItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.pid);
      const price = product ? product.priceSale : 0;
      const total = price * item.quantity;

      Products.findOneAndUpdate(
        { _id: item.pid, available: { $gte: 0 } },
        { $inc: { available: -item.quantity, sold: item.quantity } },
        { new: true, runValidators: true }
      ).exec();

      return {
        ...item,
        total,
        shop: product?.shop,
        imageUrl: product.images.length > 0 ? product.images[0].url : '',
      };
    });

    const grandTotal = updatedItems.reduce((acc, item) => acc + item.total, 0);
    let discount = 0;

    if (couponCode) {
      const couponData = await Coupons.findOne({ code: couponCode });

      const expired = isExpired(couponData.expire);
      if (expired) {
        return res
          .status(400)
          .json({ success: false, message: 'CouponCode Is Expired' });
      }
      // Add the user's email to the usedBy array of the coupon code
      await Coupons.findOneAndUpdate(
        { code: couponCode },
        { $addToSet: { usedBy: user.email } }
      );

      if (couponData && couponData.type === 'percent') {
        const percentLess = couponData.discount;
        discount = (percentLess / 100) * grandTotal;
      } else if (couponData) {
        discount = couponData.discount;
      }
    }

    let discountedTotal = grandTotal - discount;
    discountedTotal = discountedTotal || 0;

    const existingUser = await User.findOne({ email: user.email });
    const orderNo = generateOrderNumber();
    const orderCreated = await Orders.create({
      paymentMethod,
      paymentId,
      discount,
      currency,
      description: description || '',
      conversionRate,
      total: discountedTotal + Number(shipping),
      subTotal: grandTotal,
      shipping,
      items: updatedItems.map(({ image, ...others }) => others),
      user: existingUser ? { ...user, _id: existingUser._id } : user,
      totalItems,
      orderNo,
      status: 'pending',
    });

    await Notifications.create({
      opened: false,
      title: `${user.firstName} ${user.lastName} placed an order from ${user.city}.`,
      paymentMethod,
      orderId: orderCreated._id,
      city: user.city,
      cover: user?.cover?.url || '',
    });

    let htmlContent = readHTMLTemplate();

    htmlContent = htmlContent.replace(
      /{{recipientName}}/g,
      `${user.firstName} ${user.lastName}`
    );

    let itemsHtml = '';
    updatedItems.forEach((item) => {
      itemsHtml += `
        <tr style="border-bottom: 1px solid #e4e4e4;">
          <td style="border-radius: 8px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); overflow: hidden; border-spacing: 0; border: 0">
            <img src="${item.imageUrl}" alt="${item.name}" style="width: 62px; height: 62px; object-fit: cover; border-radius: 8px;">
          </td>
          <td style="padding: 10px; border-spacing: 0; border: 0">${item.name}</td>
          <td style="padding: 10px; border-spacing: 0; border: 0">${item.sku}</td>
          <td style="padding: 10px; border-spacing: 0; border: 0">${item.quantity}</td>
          <td style="padding: 10px; border-spacing: 0; border: 0">${item.priceSale}</td>
        </tr>
      `;
    });

    htmlContent = htmlContent.replace(/{{items}}/g, itemsHtml);
    htmlContent = htmlContent.replace(/{{grandTotal}}/g, orderCreated.subTotal);
    htmlContent = htmlContent.replace(/{{Shipping}}/g, orderCreated.shipping);
    htmlContent = htmlContent.replace(/{{subTotal}}/g, orderCreated.total);

    // Send email using Postmark
    await postmarkClient.sendEmail({
      From: process.env.RECEIVING_EMAIL, // Your sending email address
      To: user.email, // Customer's email address
      Subject: 'Your Order Confirmation',
      HtmlBody: htmlContent,
      TextBody: `Your order ${orderNo} has been placed successfully. Total amount: ${orderCreated.total}.`
    });

    return res.status(201).json({
      success: true,
      message: 'Order Placed',
      orderId: orderCreated._id,
      data: updatedItems.map(item => item.name),
      orderNo,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const orderGet = await Orders.findById(id);

    if (!orderGet) {
      return res
        .status(404)
        .json({ success: false, message: 'Order Not Found' });
    }

    return res.status(200).json({
      success: true,
      data: orderGet,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getOrdersByAdmin = async (req, res) => {
  try {
    const {
      page: pageQuery,
      limit: limitQuery,
      search: searchQuery,
      shop,
    } = req.query;

    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;
    const skip = limit * (page - 1);
    let matchQuery = {};

    if (shop) {
      const currentShop = await Shop.findOne({ slug: shop }).select(['_id']);
      matchQuery['items.shop'] = currentShop._id;
    }

    const totalOrders = await Orders.countDocuments({
      $or: [
        { 'user.firstName': { $regex: searchQuery || '', $options: 'i' } },
        { 'user.lastName': { $regex: searchQuery || '', $options: 'i' } },
      ],
      ...matchQuery,
    });

    const orders = await Orders.aggregate([
      { $match: { ...matchQuery } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      total: totalOrders,
      count: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOneOrderByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    await Notifications.findOneAndUpdate(
      { orderId: id },
      { opened: true },
      { new: true, runValidators: true }
    );
    const orderGet = await Orders.findById(id);
    if (!orderGet) {
      return res.status(404).json({
        success: false,
        message: 'Order Not Found',
      });
    }

    return res.status(200).json({
      success: true,
      data: orderGet,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateOrderByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const order = await Orders.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order Not Found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Order Updated',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteOrderByAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find the order to be deleted
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order Not Found',
      });
    }

    // Delete the order from the Orders collection
    await Orders.findByIdAndDelete(orderId);

    // Remove the order ID from the user's order array
    await User.findOneAndUpdate(
      { _id: order.user },
      { $pull: { orders: orderId } }
    );

    // Delete notifications related to the order
    await Notifications.deleteMany({ orderId });

    return res.status(200).json({
      success: true,
      message: 'Order Deleted',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Vendor APIs
const getOrdersByVendor = async (req, res) => {
  try {
    const vendor = await getVendor(req, res);
    const shop = await Shop.findOne({
      vendor: vendor._id.toString(),
    });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    const { limit = 10, page = 1, search = '' } = req.query;
    const skip = parseInt(limit) * (parseInt(page) - 1) || 0;
    const pipeline = [
      {
        $match: {
          'items.shop': shop._id,
          $or: [
            { 'user.firstName': { $regex: new RegExp(search, 'i') } },
            { 'user.lastName': { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
    ];
    const totalOrderCount = await Orders.aggregate([
      ...pipeline,
      { $count: 'totalOrderCount' },
    ]);
    const count =
      totalOrderCount.length > 0 ? totalOrderCount[0].totalOrderCount : 0;

    const orders = await Orders.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);
    return res.status(200).json({
      success: true,
      data: orders,
      total: count,
      count: Math.ceil(count / parseInt(limit)),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByAdmin,
  getOneOrderByAdmin,
  updateOrderByAdmin,
  deleteOrderByAdmin,
  getOrdersByVendor,
};
