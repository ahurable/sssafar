FROM node:18 AS builder

WORKDIR /app

COPY package.json ./

RUN npm install --include=dev --prefer-offline --no-audit

COPY . .

RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npm run build

FROM node:18-slim AS runner

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy application files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads
RUN chown -R nextjs:nodejs /app/uploads
RUN chmod -R 755 /app/uploads

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]