"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("../../generated/prisma/client");
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const http_1 = require("../lib/http");
const phone_1 = require("../lib/phone");
const serialization_1 = require("../lib/serialization");
const auth_service_1 = require("./auth/auth.service");
const security_1 = require("../lib/security");
const api = (0, express_1.Router)();
const decimal = (n) => new client_1.Prisma.Decimal(n);
const id = zod_1.z.string().cuid();
const output = serialization_1.serialize;
const publicUser = {
  id: true,
  phone: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
};
const authBody = zod_1.z.object({
  phone: zod_1.z.string().min(1),
  password: zod_1.z.string().min(8).max(128),
});
const addressBody = zod_1.z.object({
  label: zod_1.z.string().max(60).optional(),
  recipientName: zod_1.z.string().min(1).max(120),
  phone: zod_1.z.string(),
  province: zod_1.z.string().min(1).default("Kigali"),
  district: zod_1.z.string().min(1),
  sector: zod_1.z.string().optional(),
  cell: zod_1.z.string().optional(),
  street: zod_1.z.string().optional(),
  building: zod_1.z.string().optional(),
  instructions: zod_1.z.string().max(500).optional(),
  isDefault: zod_1.z.boolean().optional(),
});
async function getCart(userId) {
  return database_1.prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      items: {
        include: { product: { include: { inventory: true } }, variant: true },
      },
    },
  });
}
function cartSummary(cart) {
  const items = cart.items.map((item) => {
    const unitPrice = item.variant?.price ?? item.product.basePrice;
    return { ...item, unitPrice, lineTotal: unitPrice.mul(item.quantity) };
  });
  const subtotal = items.reduce(
    (total, item) => total.add(item.lineTotal),
    new client_1.Prisma.Decimal(0),
  );
  return output({
    ...cart,
    items,
    subtotal,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
  });
}
async function loadValidProduct(productId, variantId) {
  const product = await database_1.prisma.product.findFirst({
    where: { id: productId, status: client_1.ProductStatus.AVAILABLE },
    include: { inventory: true, variants: true },
  });
  if (!product)
    throw new http_1.AppError(
      404,
      "Product is unavailable",
      "PRODUCT_UNAVAILABLE",
    );
  const variant = variantId
    ? product.variants.find((v) => v.id === variantId && v.isActive)
    : undefined;
  if (variantId && !variant)
    throw new http_1.AppError(
      422,
      "Variant does not belong to this available product",
      "INVALID_VARIANT",
    );
  return { product, variant };
}
api.post(
  "/auth/register",
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = authBody
      .extend({
        firstName: zod_1.z.string().min(1).max(80),
        lastName: zod_1.z.string().max(80).optional(),
      })
      .parse(req.body);
    const user = await database_1.prisma.user.create({
      data: {
        phone: (0, phone_1.normalizeRwandaPhone)(body.phone),
        firstName: body.firstName.trim(),
        lastName: body.lastName?.trim(),
        passwordHash: await (0, security_1.hashPassword)(body.password),
      },
      select: publicUser,
    });
    const tokens = await (0, auth_service_1.issueTokens)(user, {
      ip: req.ip,
      userAgent: req.header("user-agent"),
    });
    res.status(201).json(output({ data: { user, ...tokens } }));
  }),
);
api.post(
  "/auth/login",
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = authBody.parse(req.body);
    const user = await database_1.prisma.user.findUnique({
      where: { phone: (0, phone_1.normalizeRwandaPhone)(body.phone) },
    });
    if (
      !user ||
      !user.isActive ||
      !(await (0, security_1.verifyPassword)(body.password, user.passwordHash))
    )
      throw new http_1.AppError(
        401,
        "Invalid phone number or password",
        "INVALID_CREDENTIALS",
      );
    const tokens = await (0, auth_service_1.issueTokens)(user, {
      ip: req.ip,
      userAgent: req.header("user-agent"),
    });
    res.json(
      output({
        data: { user: { ...user, passwordHash: undefined }, ...tokens },
      }),
    );
  }),
);
api.post(
  "/auth/refresh",
  (0, http_1.asyncHandler)(async (req, res) => {
    const refreshToken = zod_1.z
      .object({ refreshToken: zod_1.z.string().min(1) })
      .parse(req.body).refreshToken;
    const claims = (0, security_1.verifyRefreshToken)(refreshToken);
    if (!claims || claims.type !== "refresh" || !claims.sid)
      throw new http_1.AppError(
        401,
        "Invalid refresh token",
        "INVALID_REFRESH_TOKEN",
      );
    const session = await database_1.prisma.session.findUnique({
      where: { id: claims.sid },
      include: { user: true },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.refreshTokenHash !== (0, security_1.hashToken)(refreshToken) ||
      !session.user.isActive
    )
      throw new http_1.AppError(
        401,
        "Refresh token has expired or was revoked",
        "INVALID_REFRESH_TOKEN",
      );
    await database_1.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await (0, auth_service_1.issueTokens)(session.user, {
      ip: req.ip,
      userAgent: req.header("user-agent"),
    });
    res.json({ data: tokens });
  }),
);
api.post(
  "/auth/logout",
  (0, http_1.asyncHandler)(async (req, res) => {
    const token = zod_1.z
      .object({ refreshToken: zod_1.z.string().min(1) })
      .parse(req.body).refreshToken;
    const claims = (0, security_1.verifyRefreshToken)(token);
    if (claims?.sid)
      await database_1.prisma.session.updateMany({
        where: {
          id: claims.sid,
          refreshTokenHash: (0, security_1.hashToken)(token),
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    res.status(204).end();
  }),
);
api.get(
  "/auth/me",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const user = await database_1.prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: publicUser,
    });
    if (!user)
      throw new http_1.AppError(401, "User not found", "UNAUTHENTICATED");
    res.json({ data: user });
  }),
);
api.patch(
  "/auth/me",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({
        firstName: zod_1.z.string().min(1).max(80).optional(),
        lastName: zod_1.z.string().max(80).nullable().optional(),
      })
      .parse(req.body);
    const user = await database_1.prisma.user.update({
      where: { id: req.auth.userId },
      data: body,
      select: publicUser,
    });
    res.json({ data: user });
  }),
);
api.post(
  "/auth/change-password",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({
        currentPassword: zod_1.z.string(),
        newPassword: zod_1.z.string().min(8).max(128),
      })
      .parse(req.body);
    const user = await database_1.prisma.user.findUniqueOrThrow({
      where: { id: req.auth.userId },
    });
    if (
      !(await (0, security_1.verifyPassword)(
        body.currentPassword,
        user.passwordHash,
      ))
    )
      throw new http_1.AppError(
        401,
        "Current password is incorrect",
        "INVALID_CREDENTIALS",
      );
    await database_1.prisma.$transaction([
      database_1.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await (0, security_1.hashPassword)(body.newPassword),
        },
      }),
      database_1.prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    res.status(204).end();
  }),
);
api.get(
  "/categories",
  (0, http_1.asyncHandler)(async (_req, res) =>
    res.json({
      data: output(
        await database_1.prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
      ),
    }),
  ),
);
api.get(
  "/categories/:id",
  (0, http_1.asyncHandler)(async (req, res) => {
    const key = String(req.params.id);
    const category = await database_1.prisma.category.findFirst({
      where: { OR: [{ id: key }, { slug: key }], isActive: true },
      include: {
        products: {
          where: { status: client_1.ProductStatus.AVAILABLE },
          include: { variants: { where: { isActive: true } } },
          orderBy: { name: "asc" },
        },
      },
    });
    if (!category)
      throw new http_1.AppError(404, "Category not found", "NOT_FOUND");
    res.json({ data: output(category) });
  }),
);
api.get(
  "/products",
  (0, http_1.asyncHandler)(async (req, res) => {
    const query = zod_1.z
      .object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
        category: zod_1.z.string().optional(),
        available: zod_1.z.enum(["true", "false"]).optional(),
        featured: zod_1.z.enum(["true", "false"]).optional(),
        search: zod_1.z.string().max(100).optional(),
      })
      .parse(req.query);
    const where = {
      status:
        query.available === "false"
          ? undefined
          : client_1.ProductStatus.AVAILABLE,
      ...(query.category
        ? {
            category: {
              is: { OR: [{ id: query.category }, { slug: query.category }] },
            },
          }
        : {}),
      ...(query.featured ? { isFeatured: query.featured === "true" } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: "insensitive" } }
        : {}),
    };
    const [items, total] = await database_1.prisma.$transaction([
      database_1.prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: { where: { isActive: true } },
          inventory: true,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: "desc" },
      }),
      database_1.prisma.product.count({ where }),
    ]);
    res.json({
      data: output(items),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  }),
);
api.get(
  "/products/:id",
  (0, http_1.asyncHandler)(async (req, res) => {
    const key = String(req.params.id);
    const product = await database_1.prisma.product.findFirst({
      where: {
        OR: [{ id: key }, { slug: key }],
        status: client_1.ProductStatus.AVAILABLE,
      },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        inventory: true,
      },
    });
    if (!product)
      throw new http_1.AppError(404, "Product not found", "NOT_FOUND");
    res.json({ data: output(product) });
  }),
);
api.get(
  "/combos",
  (0, http_1.asyncHandler)(async (_req, res) =>
    res.json({
      data: output(
        await database_1.prisma.combo.findMany({
          where: { isActive: true },
          include: { items: { include: { product: true } } },
        }),
      ),
    }),
  ),
);
api.get(
  "/addresses",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) =>
    res.json({
      data: await database_1.prisma.address.findMany({
        where: { userId: req.auth.userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
    }),
  ),
);
api.post(
  "/addresses",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = addressBody.parse(req.body);
    const address = await database_1.prisma.$transaction(async (tx) => {
      if (body.isDefault)
        await tx.address.updateMany({
          where: { userId: req.auth.userId, isDefault: true },
          data: { isDefault: false },
        });
      return tx.address.create({
        data: {
          ...body,
          phone: (0, phone_1.normalizeRwandaPhone)(body.phone),
          userId: req.auth.userId,
          isDefault:
            body.isDefault ??
            (await tx.address.count({
              where: { userId: req.auth.userId },
            })) === 0,
        },
      });
    });
    res.status(201).json({ data: address });
  }),
);
api.patch(
  "/addresses/:id",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = addressBody.partial().parse(req.body);
    const owned = await database_1.prisma.address.findFirst({
      where: { id: String(req.params.id), userId: req.auth.userId },
    });
    if (!owned)
      throw new http_1.AppError(404, "Address not found", "NOT_FOUND");
    const address = await database_1.prisma.$transaction(async (tx) => {
      if (body.isDefault)
        await tx.address.updateMany({
          where: { userId: req.auth.userId },
          data: { isDefault: false },
        });
      return tx.address.update({
        where: { id: owned.id },
        data: {
          ...body,
          ...(body.phone
            ? { phone: (0, phone_1.normalizeRwandaPhone)(body.phone) }
            : {}),
        },
      });
    });
    res.json({ data: address });
  }),
);
api.delete(
  "/addresses/:id",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const result = await database_1.prisma.address.deleteMany({
      where: { id: String(req.params.id), userId: req.auth.userId },
    });
    if (!result.count)
      throw new http_1.AppError(404, "Address not found", "NOT_FOUND");
    res.status(204).end();
  }),
);
api.get(
  "/cart",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) =>
    res.json({ data: cartSummary(await getCart(req.auth.userId)) }),
  ),
);
api.post(
  "/cart/items",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({
        productId: id,
        variantId: id.optional(),
        quantity: zod_1.z.number().int().min(1).max(100),
      })
      .parse(req.body);
    await loadValidProduct(body.productId, body.variantId);
    const cart = await getCart(req.auth.userId);
    const existing = await database_1.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: body.productId,
        variantId: body.variantId ?? null,
      },
    });
    const item = existing
      ? await database_1.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: body.quantity } },
        })
      : await database_1.prisma.cartItem.create({
          data: { cartId: cart.id, ...body },
        });
    res.status(201).json({ data: item });
  }),
);
api.patch(
  "/cart/items/:itemId",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({
        quantity: zod_1.z.number().int().min(1).max(100),
        variantId: id.optional().nullable(),
      })
      .parse(req.body);
    const cart = await getCart(req.auth.userId);
    const existing = await database_1.prisma.cartItem.findFirst({
      where: { id: String(req.params.itemId), cartId: cart.id },
    });
    if (!existing)
      throw new http_1.AppError(404, "Cart item not found", "NOT_FOUND");
    await loadValidProduct(existing.productId, body.variantId ?? undefined);
    const item = await database_1.prisma.cartItem.update({
      where: { id: existing.id },
      data: body,
    });
    res.json({ data: item });
  }),
);
api.delete(
  "/cart/items/:itemId",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const cart = await getCart(req.auth.userId);
    const result = await database_1.prisma.cartItem.deleteMany({
      where: { id: String(req.params.itemId), cartId: cart.id },
    });
    if (!result.count)
      throw new http_1.AppError(404, "Cart item not found", "NOT_FOUND");
    res.status(204).end();
  }),
);
api.delete(
  "/cart",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const cart = await getCart(req.auth.userId);
    await database_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.status(204).end();
  }),
);
const checkoutBody = zod_1.z.object({
  type: zod_1.z.enum(["DELIVERY", "PICKUP"]),
  addressId: id.optional(),
  promotionCode: zod_1.z.string().trim().min(1).max(60).optional(),
  paymentMethod: zod_1.z.enum([
    "FLUTTERWAVE",
    "MOMO",
    "CARD",
    "CASH_ON_DELIVERY",
    "PAY_ON_PICKUP",
  ]),
  notes: zod_1.z.string().max(500).optional(),
  idempotencyKey: zod_1.z.string().min(8).max(128).optional(),
});
function orderNumber() {
  return `FF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${(0, security_1.randomRef)().slice(0, 6).toUpperCase()}`;
}
async function calculatePromotion(tx, code, subtotal, userId) {
  if (!code)
    return { promotion: null, discount: new client_1.Prisma.Decimal(0) };
  const now = new Date();
  const promotion = await tx.promotion.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (
    !promotion ||
    !promotion.isActive ||
    (promotion.startsAt && promotion.startsAt > now) ||
    (promotion.endsAt && promotion.endsAt < now) ||
    (promotion.usageLimit !== null &&
      promotion.usageCount >= promotion.usageLimit) ||
    (promotion.minimumOrderValue &&
      subtotal.lessThan(promotion.minimumOrderValue))
  )
    throw new http_1.AppError(
      422,
      "Promotion is not valid for this order",
      "INVALID_PROMOTION",
    );
  const raw =
    promotion.type === "PERCENTAGE"
      ? subtotal.mul(promotion.value).div(100)
      : promotion.value;
  const discount = client_1.Prisma.Decimal.min(
    raw,
    promotion.maximumDiscount ?? raw,
    subtotal,
  );
  return {
    promotion,
    discount: discount.toDecimalPlaces(
      2,
      client_1.Prisma.Decimal.ROUND_HALF_UP,
    ),
  };
}
api.post(
  "/orders",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = checkoutBody.parse(req.body);
    const userId = req.auth.userId;
    const order = await database_1.prisma.$transaction(
      async (tx) => {
        const cart = await tx.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: { include: { inventory: true } },
                variant: true,
              },
            },
          },
        });
        if (!cart?.items.length)
          throw new http_1.AppError(422, "Cart is empty", "EMPTY_CART");
        const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        let addressId;
        if (body.type === "DELIVERY") {
          if (!body.addressId)
            throw new http_1.AppError(
              422,
              "A delivery address is required",
              "ADDRESS_REQUIRED",
            );
          const address = await tx.address.findFirst({
            where: { id: body.addressId, userId },
          });
          if (!address)
            throw new http_1.AppError(
              422,
              "Invalid delivery address",
              "INVALID_ADDRESS",
            );
          addressId = address.id;
        }
        const lines = cart.items.map((item) => {
          if (
            item.product.status !== "AVAILABLE" ||
            (item.variant &&
              (!item.variant.isActive ||
                item.variant.productId !== item.productId))
          )
            throw new http_1.AppError(
              422,
              "A cart item is no longer available",
              "PRODUCT_UNAVAILABLE",
            );
          if (
            !item.product.inventory ||
            item.product.inventory.stockQuantity < item.quantity
          )
            throw new http_1.AppError(
              422,
              `Insufficient stock for ${item.product.name}`,
              "INSUFFICIENT_STOCK",
            );
          const unitPrice = item.variant?.price ?? item.product.basePrice;
          return { item, unitPrice, lineTotal: unitPrice.mul(item.quantity) };
        });
        const subtotal = lines.reduce(
          (sum, line) => sum.add(line.lineTotal),
          new client_1.Prisma.Decimal(0),
        );
        const { promotion, discount } = await calculatePromotion(
          tx,
          body.promotionCode,
          subtotal,
          userId,
        );
        const deliveryFee = new client_1.Prisma.Decimal(
          body.type === "DELIVERY" ? env_1.env.DELIVERY_FEE_RWF : 0,
        );
        const totalAmount = client_1.Prisma.Decimal.max(
          new client_1.Prisma.Decimal(0),
          subtotal.minus(discount).add(deliveryFee),
        );
        for (const line of lines) {
          const adjusted = await tx.inventory.updateMany({
            where: {
              productId: line.item.productId,
              stockQuantity: { gte: line.item.quantity },
            },
            data: { stockQuantity: { decrement: line.item.quantity } },
          });
          if (adjusted.count !== 1)
            throw new http_1.AppError(
              409,
              "Inventory changed; please review your cart",
              "STOCK_CHANGED",
            );
        }
        if (promotion) {
          const increment = await tx.promotion.updateMany({
            where: {
              id: promotion.id,
              ...(promotion.usageLimit !== null
                ? { usageCount: { lt: promotion.usageLimit } }
                : {}),
            },
            data: { usageCount: { increment: 1 } },
          });
          if (increment.count !== 1)
            throw new http_1.AppError(
              409,
              "Promotion limit was reached",
              "PROMOTION_EXHAUSTED",
            );
        }
        const created = await tx.order.create({
          data: {
            orderNumber: orderNumber(),
            userId,
            type: body.type,
            deliveryAddressId: addressId,
            customerName: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
            customerPhone: user.phone,
            subtotal,
            discountAmount: discount,
            deliveryFee,
            totalAmount,
            notes: body.notes,
            promotionId: promotion?.id,
            promotionCode: promotion?.code,
            items: {
              create: lines.map((line) => ({
                productId: line.item.productId,
                productName: line.item.product.name,
                variantName: line.item.variant?.name,
                quantity: line.item.quantity,
                unitPrice: line.unitPrice,
                lineTotal: line.lineTotal,
              })),
            },
            payments: {
              create: { method: body.paymentMethod, amount: totalAmount },
            },
          },
          include: { items: true, payments: true },
        });
        if (promotion)
          await tx.promotionRedemption.create({
            data: {
              promotionId: promotion.id,
              userId,
              orderId: created.id,
              discount,
            },
          });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return created;
      },
      {
        isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
      },
    );
    res.status(201).json({ data: output(order) });
  }),
);
api.get(
  "/orders",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const query = zod_1.z
      .object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
      })
      .parse(req.query);
    const where = req.auth.role === "ADMIN" ? {} : { userId: req.auth.userId };
    const [items, total] = await database_1.prisma.$transaction([
      database_1.prisma.order.findMany({
        where,
        include: { items: true, payments: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      database_1.prisma.order.count({ where }),
    ]);
    res.json({
      data: output(items),
      meta: { page: query.page, limit: query.limit, total },
    });
  }),
);
api.get(
  "/orders/:id",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const order = await database_1.prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: true,
        payments: true,
        deliveryAddress: true,
        riderAssignment: true,
      },
    });
    if (
      !order ||
      (req.auth.role === "CUSTOMER" && order.userId !== req.auth.userId) ||
      (req.auth.role === "RIDER" && order.riderId !== req.auth.userId)
    )
      throw new http_1.AppError(404, "Order not found", "NOT_FOUND");
    res.json({ data: output(order) });
  }),
);
const transitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "COMPLETED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
async function transitionOrder(orderId, status, actor) {
  const order = await database_1.prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order) throw new http_1.AppError(404, "Order not found", "NOT_FOUND");
  if (!transitions[order.status].includes(status))
    throw new http_1.AppError(
      422,
      "Invalid order status transition",
      "INVALID_STATUS_TRANSITION",
    );
  if (
    actor.role === "KITCHEN_STAFF" &&
    !["PREPARING", "READY"].includes(status)
  )
    throw new http_1.AppError(
      403,
      "Kitchen staff cannot make that transition",
      "FORBIDDEN",
    );
  if (
    actor.role === "RIDER" &&
    (order.riderId !== actor.userId ||
      !["OUT_FOR_DELIVERY", "DELIVERED"].includes(status))
  )
    throw new http_1.AppError(
      403,
      "Rider cannot make that transition",
      "FORBIDDEN",
    );
  const timestamp = {
    CONFIRMED: new Date(),
    PREPARING: new Date(),
    READY: new Date(),
    OUT_FOR_DELIVERY: new Date(),
    DELIVERED: new Date(),
    COMPLETED: new Date(),
    CANCELLED: new Date(),
  };
  const fields = { status };
  if (status === "CONFIRMED") fields.confirmedAt = timestamp[status];
  if (status === "PREPARING") fields.preparingAt = timestamp[status];
  if (status === "READY") fields.readyAt = timestamp[status];
  if (status === "OUT_FOR_DELIVERY")
    fields.outForDeliveryAt = timestamp[status];
  if (status === "DELIVERED") fields.deliveredAt = timestamp[status];
  if (status === "CANCELLED") fields.cancelledAt = timestamp[status];
  return database_1.prisma.order.update({
    where: { id: orderId },
    data: fields,
  });
}
api.post(
  "/orders/:id/cancel",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const order = await database_1.prisma.order.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!order || order.userId !== req.auth.userId)
      throw new http_1.AppError(404, "Order not found", "NOT_FOUND");
    if (!["PENDING", "CONFIRMED"].includes(order.status))
      throw new http_1.AppError(
        422,
        "This order can no longer be cancelled",
        "CANNOT_CANCEL",
      );
    res.json({
      data: output(await transitionOrder(order.id, "CANCELLED", req.auth)),
    });
  }),
);
api.get(
  "/payments/:id",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const payment = await database_1.prisma.payment.findUnique({
      where: { id: String(req.params.id) },
      include: { order: true },
    });
    if (
      !payment ||
      (req.auth.role === "CUSTOMER" && payment.order.userId !== req.auth.userId)
    )
      throw new http_1.AppError(404, "Payment not found", "NOT_FOUND");
    res.json({ data: output(payment) });
  }),
);
api.post(
  "/payments/initialize",
  auth_1.authenticate,
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z.object({ orderId: id }).parse(req.body);
    const payment = await database_1.prisma.payment.findFirst({
      where: { orderId: body.orderId },
      include: { order: true },
    });
    if (!payment || payment.order.userId !== req.auth.userId)
      throw new http_1.AppError(404, "Payment not found", "NOT_FOUND");
    if (!["FLUTTERWAVE", "MOMO", "CARD"].includes(payment.method))
      throw new http_1.AppError(
        422,
        "This payment method does not require online initialization",
        "INVALID_PAYMENT_METHOD",
      );
    if (!env_1.env.FLUTTERWAVE_SECRET_KEY)
      throw new http_1.AppError(
        503,
        "Online payments are not configured",
        "PAYMENT_PROVIDER_UNAVAILABLE",
      );
    const reference = `fufu_${payment.order.orderNumber}_${(0, security_1.randomRef)()}`;
    await database_1.prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PROCESSING", transactionRef: reference },
    });
    res.status(501).json({
      error: {
        code: "PAYMENT_INITIALIZATION_PENDING",
        message:
          "Configure Flutterwave API verification before enabling online payments",
      },
      data: { paymentId: payment.id, reference },
    });
  }),
);
api.post(
  "/payments/flutterwave/webhook",
  (0, http_1.asyncHandler)(async (req, res) => {
    if (
      !env_1.env.FLUTTERWAVE_WEBHOOK_SECRET ||
      req.header("verif-hash") !== env_1.env.FLUTTERWAVE_WEBHOOK_SECRET
    )
      throw new http_1.AppError(
        401,
        "Invalid webhook signature",
        "INVALID_WEBHOOK_SIGNATURE",
      );
    const body = zod_1.z
      .object({
        id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
        data: zod_1.z
          .object({
            tx_ref: zod_1.z.string().optional(),
            status: zod_1.z.string().optional(),
          })
          .optional(),
      })
      .passthrough()
      .parse(req.body);
    const eventId = String(body.id);
    const event = await database_1.prisma.paymentWebhookEvent
      .create({
        data: {
          provider: "FLUTTERWAVE",
          eventId,
          payloadHash: (0, security_1.hashToken)(JSON.stringify(body)),
        },
      })
      .catch((error) => {
        if (error.code === "P2002") return null;
        throw error;
      });
    if (!event)
      return res
        .status(200)
        .json({ data: { received: true, duplicate: true } });
    /* Verification against Flutterwave's transaction endpoint is intentionally not faked. */ res
      .status(202)
      .json({ data: { received: true, verified: false } });
  }),
);
api.get(
  "/kitchen/orders",
  auth_1.authenticate,
  (0, auth_1.allow)("KITCHEN_STAFF", "ADMIN"),
  (0, http_1.asyncHandler)(async (_req, res) =>
    res.json({
      data: output(
        await database_1.prisma.order.findMany({
          where: { status: { in: ["CONFIRMED", "PREPARING"] } },
          include: { items: true },
          orderBy: { createdAt: "asc" },
        }),
      ),
    }),
  ),
);
api.patch(
  "/kitchen/orders/:id/status",
  auth_1.authenticate,
  (0, auth_1.allow)("KITCHEN_STAFF", "ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({ status: zod_1.z.enum(["PREPARING", "READY"]) })
      .parse(req.body);
    res.json({
      data: output(
        await transitionOrder(String(req.params.id), body.status, req.auth),
      ),
    });
  }),
);
api.get(
  "/rider/orders",
  auth_1.authenticate,
  (0, auth_1.allow)("RIDER"),
  (0, http_1.asyncHandler)(async (req, res) =>
    res.json({
      data: output(
        await database_1.prisma.order.findMany({
          where: {
            riderId: req.auth.userId,
            status: { in: ["READY", "OUT_FOR_DELIVERY"] },
          },
          include: { deliveryAddress: true, items: true },
          orderBy: { createdAt: "asc" },
        }),
      ),
    }),
  ),
);
api.patch(
  "/rider/orders/:id/status",
  auth_1.authenticate,
  (0, auth_1.allow)("RIDER"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({ status: zod_1.z.enum(["OUT_FOR_DELIVERY", "DELIVERED"]) })
      .parse(req.body);
    res.json({
      data: output(
        await transitionOrder(String(req.params.id), body.status, req.auth),
      ),
    });
  }),
);
const productBody = zod_1.z.object({
  categoryId: id,
  name: zod_1.z.string().min(1).max(120),
  slug: zod_1.z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: zod_1.z.string().max(2000).optional().nullable(),
  imageUrl: zod_1.z.string().url().optional().nullable(),
  basePrice: zod_1.z.number().nonnegative(),
  status: zod_1.z.enum(["AVAILABLE", "UNAVAILABLE", "ARCHIVED"]).optional(),
  isFeatured: zod_1.z.boolean().optional(),
});
api.post(
  "/admin/categories",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({
        name: zod_1.z.string().min(1).max(80),
        slug: zod_1.z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        imageUrl: zod_1.z.string().url().optional(),
        sortOrder: zod_1.z.number().int().nonnegative().default(0),
        isActive: zod_1.z.boolean().default(true),
      })
      .parse(req.body);
    res
      .status(201)
      .json({ data: await database_1.prisma.category.create({ data: body }) });
  }),
);
api.patch(
  "/admin/categories/:id",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({
        name: zod_1.z.string().min(1).max(80).optional(),
        slug: zod_1.z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .optional(),
        imageUrl: zod_1.z.string().url().nullable().optional(),
        sortOrder: zod_1.z.number().int().nonnegative().optional(),
        isActive: zod_1.z.boolean().optional(),
      })
      .parse(req.body);
    res.json({
      data: await database_1.prisma.category.update({
        where: { id: String(req.params.id) },
        data: body,
      }),
    });
  }),
);
api.post(
  "/admin/products",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = productBody.parse(req.body);
    res.status(201).json({
      data: output(
        await database_1.prisma.product.create({
          data: {
            ...body,
            basePrice: decimal(body.basePrice),
            inventory: { create: { stockQuantity: 0 } },
          },
        }),
      ),
    });
  }),
);
api.patch(
  "/admin/products/:id",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = productBody.partial().parse(req.body);
    res.json({
      data: output(
        await database_1.prisma.product.update({
          where: { id: String(req.params.id) },
          data: {
            ...body,
            ...(body.basePrice !== undefined
              ? { basePrice: decimal(body.basePrice) }
              : {}),
          },
        }),
      ),
    });
  }),
);
api.post(
  "/admin/products/:id/variants",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const productId = String(req.params.id);
    const body = zod_1.z
      .object({
        name: zod_1.z.string().min(1).max(80),
        price: zod_1.z.number().nonnegative(),
        isDefault: zod_1.z.boolean().default(false),
        isActive: zod_1.z.boolean().default(true),
      })
      .parse(req.body);
    if (body.isDefault)
      await database_1.prisma.productVariant.updateMany({
        where: { productId },
        data: { isDefault: false },
      });
    res.status(201).json({
      data: output(
        await database_1.prisma.productVariant.create({
          data: { productId, ...body, price: decimal(body.price) },
        }),
      ),
    });
  }),
);
api.patch(
  "/admin/products/:id/inventory",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const productId = String(req.params.id);
    const body = zod_1.z
      .object({
        stockQuantity: zod_1.z.number().int().nonnegative(),
        lowStockThreshold: zod_1.z.number().int().nonnegative().optional(),
      })
      .parse(req.body);
    res.json({
      data: await database_1.prisma.inventory.upsert({
        where: { productId },
        create: {
          productId,
          stockQuantity: body.stockQuantity,
          lowStockThreshold: body.lowStockThreshold ?? 5,
        },
        update: body,
      }),
    });
  }),
);
api.get(
  "/admin/inventory/low-stock",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (_req, res) =>
    res.json({
      data: output(
        await database_1.prisma.inventory.findMany({
          where: { stockQuantity: { lte: 5 } },
          include: { product: true },
        }),
      ),
    }),
  ),
);
api.post(
  "/admin/promotions",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({
        name: zod_1.z.string().min(1),
        code: zod_1.z.string().trim().toUpperCase().optional(),
        description: zod_1.z.string().optional(),
        type: zod_1.z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
        value: zod_1.z.number().positive(),
        minimumOrderValue: zod_1.z.number().nonnegative().optional(),
        maximumDiscount: zod_1.z.number().nonnegative().optional(),
        startsAt: zod_1.z.coerce.date().optional(),
        endsAt: zod_1.z.coerce.date().optional(),
        usageLimit: zod_1.z.number().int().positive().optional(),
        isActive: zod_1.z.boolean().default(true),
      })
      .parse(req.body);
    res.status(201).json({
      data: output(
        await database_1.prisma.promotion.create({
          data: {
            ...body,
            value: decimal(body.value),
            minimumOrderValue:
              body.minimumOrderValue === undefined
                ? undefined
                : decimal(body.minimumOrderValue),
            maximumDiscount:
              body.maximumDiscount === undefined
                ? undefined
                : decimal(body.maximumDiscount),
          },
        }),
      ),
    });
  }),
);
api.post(
  "/admin/orders/:id/assign-rider",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z.object({ riderId: id }).parse(req.body);
    const [order, rider] = await Promise.all([
      database_1.prisma.order.findUnique({
        where: { id: String(req.params.id) },
      }),
      database_1.prisma.user.findFirst({
        where: { id: body.riderId, role: "RIDER", isActive: true },
      }),
    ]);
    if (
      !order ||
      order.type !== "DELIVERY" ||
      !["READY", "OUT_FOR_DELIVERY"].includes(order.status)
    )
      throw new http_1.AppError(
        422,
        "Order is not ready for rider assignment",
        "INVALID_ASSIGNMENT",
      );
    if (!rider)
      throw new http_1.AppError(
        422,
        "Eligible rider not found",
        "INVALID_RIDER",
      );
    const result = await database_1.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { riderId: rider.id },
      });
      return tx.riderAssignment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          riderId: rider.id,
          assignedBy: req.auth.userId,
        },
        update: {
          riderId: rider.id,
          assignedBy: req.auth.userId,
          assignedAt: new Date(),
        },
      });
    });
    res.json({ data: result });
  }),
);
api.patch(
  "/admin/orders/:id/status",
  auth_1.authenticate,
  (0, auth_1.allow)("ADMIN"),
  (0, http_1.asyncHandler)(async (req, res) => {
    const body = zod_1.z
      .object({
        status: zod_1.z.enum([
          "CONFIRMED",
          "PREPARING",
          "READY",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "COMPLETED",
          "CANCELLED",
        ]),
      })
      .parse(req.body);
    res.json({
      data: output(
        await transitionOrder(String(req.params.id), body.status, req.auth),
      ),
    });
  }),
);
exports.default = api;
//# sourceMappingURL=api.js.map
