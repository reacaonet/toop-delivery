import { VehicleCategoryRuleModel } from '../models/VehicleCategoryRule';

export const RIDE_CATEGORY_LABELS: Record<string, string> = {
  car_basic: 'Carro Básico',
  car_comfort: 'Confort',
  car_black: 'Black',
  moto_basic: 'Moto Básica',
  moto_comfort: 'Moto Confort',
  moto_black: 'Moto Black',
  taxi: 'Táxi',
};

export const CAR_TIERS: Record<string, number> = {
  car_basic: 1,
  car_comfort: 2,
  car_black: 3,
};

export const MOTO_TIERS: Record<string, number> = {
  moto_basic: 1,
  moto_comfort: 2,
  moto_black: 3,
};

export interface VehicleProfile {
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
}

interface VehicleRule {
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  category: string;
}

const CAR_ROUTES: VehicleRule[] = [
  // --- Elétricos / híbridos / marcas premium => Black ---
  { brand: 'byd', category: 'car_black' },
  { brand: 'gwm', category: 'car_black' },
  { brand: 'great wall', category: 'car_black' },
  { brand: 'haval', category: 'car_black' },
  { brand: 'ora', category: 'car_black' },
  { brand: 'tesla', category: 'car_black' },
  { brand: 'volvo', category: 'car_black' },
  { brand: 'bmw', category: 'car_black' },
  { brand: 'mercedes', category: 'car_black' },
  { brand: 'audi', category: 'car_black' },
  { brand: 'lexus', category: 'car_black' },
  { brand: 'porsche', category: 'car_black' },
  { brand: 'jaguar', category: 'car_black' },
  { brand: 'land rover', category: 'car_black' },
  { brand: 'range rover', category: 'car_black' },
  { brand: 'jac', category: 'car_black' },
  { brand: 'changan', category: 'car_black' },
  { brand: 'jeep', category: 'car_black' },
  // --- SUVs / crossovers / picapes premium => Black ---
  { brand: 'fiat', model: 'fastback', category: 'car_black' },
  { brand: 'fiat', model: 'pulse', category: 'car_comfort' },
  { brand: 'fiat', model: 'toro', category: 'car_black' },
  { brand: 'fiat', model: 'strada', category: 'car_comfort' },
  { brand: 'chevrolet', model: 'tracker', category: 'car_comfort' },
  { brand: 'chevrolet', model: 'equinox', category: 'car_black' },
  { brand: 'chevrolet', model: 'blazer', category: 'car_black' },
  { brand: 'chevrolet', model: 's10', category: 'car_black' },
  { brand: 'chevrolet', model: 'montana', category: 'car_comfort' },
  { brand: 'chevrolet', model: 'captiva', category: 'car_comfort' },
  { brand: 'volkswagen', model: 'taos', category: 'car_black' },
  { brand: 'volkswagen', model: 'tcross', category: 'car_comfort' },
  { brand: 'volkswagen', model: 'nivus', category: 'car_comfort' },
  { brand: 'volkswagen', model: 'amarok', category: 'car_black' },
  { brand: 'hyundai', model: 'creta', category: 'car_comfort' },
  { brand: 'hyundai', model: 'tucson', category: 'car_black' },
  { brand: 'hyundai', model: 'ix35', category: 'car_black' },
  { brand: 'hyundai', model: 'santa fe', category: 'car_black' },
  { brand: 'honda', model: 'hrv', category: 'car_comfort' },
  { brand: 'honda', model: 'crv', category: 'car_black' },
  { brand: 'honda', model: 'wrv', category: 'car_comfort' },
  { brand: 'honda', model: 'zrv', category: 'car_black' },
  { brand: 'toyota', model: 'corolla cross', category: 'car_black' },
  { brand: 'toyota', model: 'rav4', category: 'car_black' },
  { brand: 'toyota', model: 'hilux', category: 'car_black' },
  { brand: 'toyota', model: 'sw4', category: 'car_black' },
  { brand: 'nissan', model: 'kicks', category: 'car_comfort' },
  { brand: 'nissan', model: 'frontier', category: 'car_black' },
  { brand: 'renault', model: 'duster', category: 'car_comfort' },
  { brand: 'renault', model: 'captur', category: 'car_comfort' },
  { brand: 'renault', model: 'stepway', category: 'car_comfort' },
  { brand: 'renault', model: 'kardian', category: 'car_comfort' },
  { brand: 'renault', model: 'punch', category: 'car_basic' },
  { brand: 'peugeot', model: '2008', category: 'car_comfort' },
  { brand: 'peugeot', model: '3008', category: 'car_black' },
  { brand: 'peugeot', model: '5008', category: 'car_black' },
  { brand: 'citroen', model: 'c3 aircross', category: 'car_comfort' },
  { brand: 'citroen', model: 'aircross', category: 'car_comfort' },
  { brand: 'citroen', model: 'c4 cactus', category: 'car_comfort' },
  { brand: 'mitsubishi', model: 'asx', category: 'car_comfort' },
  { brand: 'mitsubishi', model: 'outlander', category: 'car_black' },
  { brand: 'mitsubishi', model: 'eclipse', category: 'car_black' },
  { brand: 'mitsubishi', model: 'l200', category: 'car_black' },
  { brand: 'mitsubishi', model: 'pajero', category: 'car_black' },
  { brand: 'kia', model: 'sportage', category: 'car_comfort' },
  { brand: 'kia', model: 'stonic', category: 'car_comfort' },
  { brand: 'kia', model: 'sorento', category: 'car_black' },
  { brand: 'suzuki', model: 'jimny', category: 'car_black' },
  { brand: 'suzuki', model: 'vitara', category: 'car_comfort' },
  { brand: 'ford', model: 'ecosport', category: 'car_comfort' },
  { brand: 'ford', model: 'territory', category: 'car_black' },
  { brand: 'ford', model: 'ranger', category: 'car_black' },
  { brand: 'chery', model: 'tiggo', category: 'car_black' },
  // --- Sedãs de linha alta / premium => Black ---
  { brand: 'toyota', model: 'corolla', category: 'car_black' },
  { brand: 'toyota', model: 'camry', category: 'car_black' },
  { brand: 'toyota', model: 'prius', category: 'car_black' },
  { brand: 'honda', model: 'accord', category: 'car_black' },
  { brand: 'nissan', model: 'sentra', category: 'car_black' },
  { brand: 'volkswagen', model: 'jetta', category: 'car_black' },
  { brand: 'volkswagen', model: 'passat', category: 'car_black' },
  { brand: 'ford', model: 'fusion', category: 'car_black' },
  // --- Sedãs / hatches médios => Confort ---
  { brand: 'honda', model: 'civic', category: 'car_comfort' },
  { brand: 'honda', model: 'city', category: 'car_comfort' },
  { brand: 'chevrolet', model: 'cruze', category: 'car_comfort' },
  { brand: 'fiat', model: 'cronos', category: 'car_comfort' },
  { brand: 'renault', model: 'fluence', category: 'car_comfort' },
  { brand: 'renault', model: 'megane', category: 'car_comfort' },
  { brand: 'citroen', model: 'c4', category: 'car_comfort' },
  { brand: 'kia', model: 'cerato', category: 'car_comfort' },
  { brand: 'chery', model: 'arrizo', category: 'car_comfort' },
  // --- Populares / básicos => Básico (independente do ano) ---
  { brand: 'chevrolet', model: 'onix', category: 'car_basic' },
  { brand: 'chevrolet', model: 'prisma', category: 'car_basic' },
  { brand: 'chevrolet', model: 'cobalt', category: 'car_basic' },
  { brand: 'chevrolet', model: 'corsa', category: 'car_basic' },
  { brand: 'chevrolet', model: 'celta', category: 'car_basic' },
  { brand: 'chevrolet', model: 'agile', category: 'car_basic' },
  { brand: 'chevrolet', model: 'spark', category: 'car_basic' },
  { brand: 'fiat', model: 'argo', category: 'car_basic' },
  { brand: 'fiat', model: 'mobi', category: 'car_basic' },
  { brand: 'fiat', model: 'uno', category: 'car_basic' },
  { brand: 'fiat', model: 'palio', category: 'car_basic' },
  { brand: 'fiat', model: 'punto', category: 'car_basic' },
  { brand: 'fiat', model: 'siena', category: 'car_basic' },
  { brand: 'volkswagen', model: 'gol', category: 'car_basic' },
  { brand: 'volkswagen', model: 'voyage', category: 'car_basic' },
  { brand: 'volkswagen', model: 'polo', category: 'car_basic' },
  { brand: 'volkswagen', model: 'up', category: 'car_basic' },
  { brand: 'volkswagen', model: 'saveiro', category: 'car_basic' },
  { brand: 'renault', model: 'kwid', category: 'car_basic' },
  { brand: 'renault', model: 'sandero', category: 'car_basic' },
  { brand: 'renault', model: 'logan', category: 'car_basic' },
  { brand: 'peugeot', model: '208', category: 'car_basic' },
  { brand: 'citroen', model: 'c3', category: 'car_basic' },
  { brand: 'toyota', model: 'etios', category: 'car_basic' },
  { brand: 'toyota', model: 'yaris', category: 'car_basic' },
  { brand: 'honda', model: 'fit', category: 'car_basic' },
  { brand: 'nissan', model: 'march', category: 'car_basic' },
  { brand: 'ford', model: 'ka', category: 'car_basic' },
  { brand: 'ford', model: 'fiesta', category: 'car_basic' },
  { brand: 'kia', model: 'picanto', category: 'car_basic' },
];

function normalizeVehicleText(value?: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

let rulesCache: VehicleRule[] = [];
let cacheLoaded = false;
let cacheVersion = 0;

const CACHE_TTL_MS = 60_000;
let cacheLastLoad = 0;

async function ensureRulesCache(): Promise<VehicleRule[]> {
  const now = Date.now();
  if (!cacheLoaded || now - cacheLastLoad > CACHE_TTL_MS) {
    cacheLoaded = true;
    cacheLastLoad = now;
    const dbRules = await VehicleCategoryRuleModel.find({ active: true })
      .sort({ order: 1, _id: 1 })
      .lean();
    rulesCache = dbRules.map((r: any) => ({
      brand: r.brand || undefined,
      model: r.model || undefined,
      yearMin: r.yearMin ?? undefined,
      yearMax: r.yearMax ?? undefined,
      category: r.category,
    }));
    cacheVersion += 1;
  }
  return rulesCache;
}

export function invalidateVehicleRulesCache(): void {
  cacheLoaded = false;
  cacheLastLoad = 0;
}

export async function seedVehicleCategoryRules(): Promise<void> {
  const count = await VehicleCategoryRuleModel.countDocuments();
  if (count > 0) return;
  const docs = CAR_ROUTES.map((r, i) => ({
    brand: r.brand || '',
    model: r.model || '',
    yearMin: r.yearMin ?? null,
    yearMax: r.yearMax ?? null,
    category: r.category,
    active: true,
    order: i,
  }));
  await VehicleCategoryRuleModel.insertMany(docs);
  invalidateVehicleRulesCache();
  console.log(`[VehicleCategory] Seed de regras de classificação inserido (${docs.length})`);
}

export async function listVehicleCategoryRules(): Promise<any[]> {
  const rows = await VehicleCategoryRuleModel.find({})
    .sort({ order: 1, _id: 1 })
    .lean();
  return rows.map((r: any) => ({
    _id: r._id,
    brand: r.brand || '',
    model: r.model || '',
    yearMin: r.yearMin ?? null,
    yearMax: r.yearMax ?? null,
    category: r.category,
    active: r.active,
    order: r.order,
  }));
}

export async function upsertVehicleCategoryRule(input: {
  _id?: string;
  brand?: string;
  model?: string;
  yearMin?: number | null;
  yearMax?: number | null;
  category: string;
  active?: boolean;
  order?: number;
}): Promise<any> {
  const payload: any = {
    brand: ['any', '*'].includes((input.brand || '').toLowerCase().trim()) ? '' : (input.brand || '').toLowerCase().trim(),
    model: ['any', '*'].includes((input.model || '').toLowerCase().trim()) ? '' : (input.model || '').toLowerCase().trim(),
    yearMin: input.yearMin ?? null,
    yearMax: input.yearMax ?? null,
    category: input.category,
  };
  if (input.active !== undefined) payload.active = input.active;
  if (input.order !== undefined) payload.order = input.order;

  let doc;
  if (input._id) {
    const existing = await VehicleCategoryRuleModel.findById(input._id);
    if (!existing) throw new Error('Regra não encontrada');
    const merged: any = {
      brand: payload.brand || existing.brand || '',
      model: payload.model || existing.model || '',
      yearMin: payload.yearMin ?? (existing as any).yearMin ?? null,
      yearMax: payload.yearMax ?? (existing as any).yearMax ?? null,
      category: payload.category || existing.category,
      order: payload.order ?? (existing as any).order ?? 0,
    };
    if (payload.active !== undefined) merged.active = payload.active;
    doc = await VehicleCategoryRuleModel.findByIdAndUpdate(input._id, merged, { new: true, runValidators: true });
  } else {
    const maxOrder = await VehicleCategoryRuleModel.countDocuments({});
    doc = await VehicleCategoryRuleModel.create({ ...payload, order: input.order ?? maxOrder });
  }
  invalidateVehicleRulesCache();
  return doc;
}

export async function deleteVehicleCategoryRule(id: string): Promise<void> {
  await VehicleCategoryRuleModel.findByIdAndDelete(id);
  invalidateVehicleRulesCache();
}

export async function getVehicleCategoryOptions(brand?: string): Promise<{ brands: string[]; models: string[] }> {
  const rules = await ensureRulesCache();
  const brands = new Set<string>();
  const models = new Set<string>();
  const b = normalizeVehicleText(brand);
  for (const r of rules) {
    if (!r.brand) continue;
    if (b && !r.brand.includes(b)) continue;
    brands.add(r.brand);
    if (b) models.add(r.model || r.brand);
  }
  return { brands: [...brands].sort(), models: [...models].sort() };
}

function ruleMatches(rule: VehicleRule, brand: string, model: string, year?: number): boolean {
  if (rule.brand && !(brand.includes(rule.brand) || rule.brand.includes(brand))) return false;
  if (rule.model && !(model.includes(rule.model) || rule.model.includes(model))) return false;
  if (rule.yearMin != null && (year == null || year < rule.yearMin)) return false;
  if (rule.yearMax != null && (year == null || year > rule.yearMax)) return false;
  return true;
}

function activeRulesSync(): VehicleRule[] {
  if (cacheLoaded && rulesCache.length >= 0) return rulesCache;
  return CAR_ROUTES;
}

export function classifyVehicle(profile: VehicleProfile): { code: string; label: string } {
  const vehicleType = profile.vehicleType || 'motorcycle';

  if (vehicleType === 'taxi') {
    return { code: 'taxi', label: RIDE_CATEGORY_LABELS.taxi };
  }

  if (vehicleType === 'car' || vehicleType === 'van') {
    const brand = normalizeVehicleText(profile.vehicleBrand);
    const model = normalizeVehicleText(profile.vehicleModel);
    const year =
      typeof profile.vehicleYear === 'number' && !isNaN(profile.vehicleYear)
        ? profile.vehicleYear
        : undefined;

    if (brand || model) {
      for (const rule of activeRulesSync()) {
        if (ruleMatches(rule, brand, model, year)) {
          return { code: rule.category, label: RIDE_CATEGORY_LABELS[rule.category] || rule.category };
        }
      }
    }
    return { code: 'car_basic', label: RIDE_CATEGORY_LABELS.car_basic };
  }

  if (vehicleType === 'motorcycle' || vehicleType === 'bike') {
    return { code: 'moto_basic', label: RIDE_CATEGORY_LABELS.moto_basic };
  }

  return { code: 'car_basic', label: RIDE_CATEGORY_LABELS.car_basic };
}

export function getVehicleRules(): VehicleRule[] {
  return activeRulesSync();
}

export function classifyVehicleCode(profile: VehicleProfile): string {
  return classifyVehicle(profile).code;
}

/**
 * Categorias de motorista que podem receber uma corrida de determinada
 * categoria de veículo (categoria exata + superiores).
 */
export function driverCategoriesForBooking(bookingVehicleType?: string): string[] {
  const v = String(bookingVehicleType || 'car').toLowerCase();

  if (v === 'taxi' || v.startsWith('taxi')) return ['taxi'];
  if (v.startsWith('moto')) {
    if (v === 'moto_black') return ['moto_black'];
    if (v === 'moto_comfort') return ['moto_comfort', 'moto_black'];
    return ['moto_basic', 'moto_comfort', 'moto_black'];
  }
  if (v === 'car_black') return ['car_black'];
  if (v === 'car_comfort') return ['car_comfort', 'car_black'];
  return ['car_basic', 'car_comfort', 'car_black'];
}

/**
 * Tipos de corrida (vehicleType do booking) que um motorista, pela sua
 * categoria, pode aceitar. Legado (sem categoria) usa a classificação atual.
 */
export function bookingTypesForDriver(driver: VehicleProfile & { rideCategoryCode?: string }): string[] {
  const code = driver.rideCategoryCode || classifyVehicleCode(driver);

  if (code === 'taxi') return ['taxi'];
  if (code.startsWith('car')) {
    const tier = CAR_TIERS[code] ?? 1;
    const all = ['car', 'car_basic', 'car_comfort', 'car_black'] as const;
    return all.filter((t) => (t === 'car' ? true : (CAR_TIERS[t] ?? 1) <= tier));
  }
  if (code.startsWith('moto')) {
    const tier = MOTO_TIERS[code] ?? 1;
    const all = ['moto', 'moto_basic', 'moto_comfort', 'moto_black'] as const;
    return all.filter((t) => (t === 'moto' ? true : (MOTO_TIERS[t] ?? 1) <= tier));
  }
  return [];
}