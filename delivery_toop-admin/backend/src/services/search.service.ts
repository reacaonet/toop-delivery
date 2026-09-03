import { CompanyModel } from '../models/Company';
import { ProductModel } from '../models/Product';
import { AccessoriesProductModel } from '../models/AccessoriesProduct';
import { AppError } from '../middleware/errorHandler';

const limitCompany = 10;
const limitProduct = 15;

function buildCompanyOr(searchText: string) {
  const safe = searchText.trim().toLowerCase();
  return [
    { name: { $regex: `.*${safe}.*`, $options: 'i' } },
    { tags: { $in: [safe] } },
    { category: { $regex: `.*${safe}.*`, $options: 'i' } },
  ];
}

export class SearchService {
  async searchCompanyProducts(query: {
    searchText?: string;
    companyType?: string;
    latitude?: string;
    longitude?: string;
  }) {
    const { searchText, companyType } = query;

    if (!searchText) throw new AppError('Informe o que você procura', 400);
    if (!companyType) throw new AppError('Informe um tipo da empresa', 400);

    const filter: any = { active: true };
    if (companyType && companyType !== 'restaurant' && companyType !== 'supermarket') {
      filter.category = companyType;
    }
    filter.$or = buildCompanyOr(searchText);

    const companies = await CompanyModel.find(filter).limit(limitCompany).lean();
    const result = await this.attachProducts(companies, searchText);

    return result;
  }

  async searchSegments(query: {
    searchText?: string;
    latitude?: string;
    longitude?: string;
  }) {
    const { searchText } = query;
    if (!searchText) throw new AppError('Informe o que você procura', 400);

    const filter: any = { active: true };
    filter.$or = buildCompanyOr(searchText);

    const companies = await CompanyModel.find(filter).limit(100).lean();
    const result = await this.attachProducts(companies, searchText);

    return result;
  }

  private async attachProducts(companies: any[], searchText: string) {
    const result: any[] = [];

    for (const company of companies) {
      const safe = searchText.trim().toLowerCase();

      const productFilter: any = {
        company: company._id,
      };
      productFilter.$or = [
        { name: { $regex: `.*${safe}.*`, $options: 'i' } },
      ];

      const [products, accessories] = await Promise.all([
        ProductModel.find({ ...productFilter, active: true }).limit(limitProduct).lean(),
        AccessoriesProductModel.find({ ...productFilter, isPaused: { $ne: true } }).limit(limitProduct).lean(),
      ]);

      const all = [...products, ...accessories];
      if (all.length === 0) continue;

      result.push({
        _id: company._id,
        name: company.name,
        description: company.description,
        images: company.images,
        category: company.category,
        type: company.category,
        products: all,
        totalProducts: all.length,
      });
    }

    return result;
  }
}

export default new SearchService();
