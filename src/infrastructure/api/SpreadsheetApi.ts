import { CanonicalDataset } from '@/domain/dataset/CanonicalDataset';
import { GeneratedSpreadsheet } from '@/domain/spreadsheet/GeneratedSpreadsheet';
import { GenerateExcelUseCase } from '@/application/use-cases/GenerateExcelUseCase';

export class SpreadsheetApi {
  public async generateSpreadsheet(
    dataset: CanonicalDataset,
    filename?: string
  ): Promise<GeneratedSpreadsheet> {
    return GenerateExcelUseCase.execute(dataset, filename);
  }

  public downloadSpreadsheet(spreadsheet: GeneratedSpreadsheet): void {
    const url = URL.createObjectURL(spreadsheet.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = spreadsheet.filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
