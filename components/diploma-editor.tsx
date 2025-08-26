"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Type, ImageIcon, Save, Trash2, Download, PenTool, FileText, X, CheckCircle } from "lucide-react"
import { FileUpload } from "./file-upload"
import { CSVProcessor } from "./csv-processor"
import { PDFGenerator } from "./pdf-generator"

interface DiplomaField {
  id: string
  type: "text" | "image" | "signature"
  title: string
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  color: string
  fontWeight: string
}

interface DiplomaEditorProps {
  language?: keyof typeof translations
}

const translations = {
  en: {
    diplomaEditor: "Diploma Editor",
    customize: "Customize your diploma template with drag-and-drop editing",
    design: "Design",
    data: "Data",
    chooseTemplate: "Choose Template",
    uploadTemplate: "Upload Template",
    addElements: "Add Elements",
    addTextField: "Add Text Field",
    addLogo: "Add Logo/Image",
    addSignature: "Add Signature",
    fieldProperties: "Field Properties",
    content: "Content",
    fontSize: "Font Size",
    color: "Color",
    fontFamily: "Font Family",
    fontWeight: "Font Weight",
    fields: "Fields",
    dataFormat: "Data Format Example",
    downloadExample: "Download an example file with the correct format",
    downloadExampleCSV: "Download Example CSV",
    downloadExampleExcel: "Download Example Excel",
    currentFields: "Current fields:",
    generatePDF: "Generate PDF",
    saveTemplate: "Save Template",
    dragToMove: "Drag to move",
    clickToSelect: "Click any field to select and drag to move",
    addText: "Add Text Field",
    addImage: "Add Logo/Image",
    editField: "Field Properties",
    // Inside each language object, add:
    records: "Records",       // or "Registros" in ES, "Enregistrements" in FR, etc.
    loaded: "loaded",         // "cargados", "chargés", etc.
    with: "with",             // "con", "avec", etc.

  },
  es: {
    diplomaEditor: "Editor de Diplomas",
    customize: "Personaliza tu plantilla de diploma con edición de arrastrar y soltar",
    design: "Diseño",
    data: "Datos",
    chooseTemplate: "Elegir Plantilla",
    uploadTemplate: "Subir Plantilla",
    addElements: "Agregar Elementos",
    addTextField: "Agregar Campo de Texto",
    addLogo: "Agregar Logo/Imagen",
    addSignature: "Agregar Firma",
    fieldProperties: "Propiedades del Campo",
    content: "Contenido",
    fontSize: "Tamaño de Fuente",
    color: "Color",
    fontFamily: "Familia de Fuente",
    fontWeight: "Peso de Fuente",
    fields: "Campos",
    records: "Registros",
    loaded: "cargados",
    with: "con",
    dataFormat: "Ejemplo de Formato de Datos",
    downloadExample: "Descargar un archivo de ejemplo con el formato correcto",
    downloadExampleCSV: "Descargar Ejemplo CSV",
    downloadExampleExcel: "Descargar Ejemplo Excel",
    currentFields: "Campos actuales:",
    generatePDF: "Generar PDF",
    saveTemplate: "Guardar Plantilla",
    dragToMove: "Arrastra para mover",
    clickToSelect: "Haz clic en cualquier campo para seleccionar y arrastrar para mover",
    addText: "Agregar Campo de Texto",
    addImage: "Agregar Logo/Imagen",
    editField: "Propiedades del Campo",
  },
  ar: {
    diplomaEditor: "محرر الشهادات",
    customize: "خصص قالب شهادتك مع التحرير بالسحب والإفلات",
    design: "التصميم",
    data: "البيانات",
    chooseTemplate: "اختر القالب",
    uploadTemplate: "رفع القالب",
    addElements: "إضافة عناصر",
    addTextField: "إضافة حقل نص",
    addLogo: "إضافة شعار/صورة",
    addSignature: "إضافة توقيع",
    fieldProperties: "خصائص الحقل",
    content: "المحتوى",
    fontSize: "حجم الخط",
    color: "اللون",
    fontFamily: "عائلة الخط",
    fontWeight: "وزن الخط",
    fields: "الحقول",
    records: "سجلات",
    loaded: "تم تحميلها",
    with: "مع",

    dataFormat: "مثال تنسيق البيانات",
    downloadExample: "تحميل ملف مثال بالتنسيق الصحيح",
    downloadExampleCSV: "تحميل مثال CSV",
    downloadExampleExcel: "تحميل مثال Excel",
    currentFields: "الحقول الحالية:",
    generatePDF: "إنشاء PDF",
    saveTemplate: "حفظ القالب",
    dragToMove: "اسحب للتحريك",
    clickToSelect: "انقر على أي حقل للتحديد واسحب للتحريك",
    addText: "إضافة حقل نص",
    addImage: "إضافة شعار/صورة",
    editField: "خصائص الحقل",
  },
  fr: {
    diplomaEditor: "Éditeur de Diplômes",
    customize: "Personnalisez votre modèle de diplôme avec l'édition par glisser-déposer",
    design: "Design",
    data: "Données",
    chooseTemplate: "Choisir un Modèle",
    uploadTemplate: "Télécharger un Modèle",
    addElements: "Ajouter des Éléments",
    addTextField: "Ajouter un Champ de Texte",
    addLogo: "Ajouter un Logo/Image",
    addSignature: "Ajouter une Signature",
    fieldProperties: "Propriétés du Champ",
    content: "Contenu",
    fontSize: "Taille de Police",
    color: "Couleur",
    fontFamily: "Famille de Police",
    fontWeight: "Poids de Police",
    fields: "Champs",
    records: "Enregistrements",
    loaded: "chargés",
    with: "avec",

    dataFormat: "Exemple de Format de Données",
    downloadExample: "Télécharger un fichier d'exemple avec le bon format",
    downloadExampleCSV: "Télécharger Exemple CSV",
    downloadExampleExcel: "Télécharger Exemple Excel",
    currentFields: "Champs actuels:",
    generatePDF: "Générer PDF",
    saveTemplate: "Sauvegarder le Modèle",
    dragToMove: "Glisser pour déplacer",
    clickToSelect: "Cliquez sur n'importe quel champ pour sélectionner et glisser pour déplacer",
    addText: "Ajouter un Champ de Texte",
    addImage: "Ajouter un Logo/Image",
    editField: "Propriétés du Champ",
  },
  zh: {
    diplomaEditor: "文凭编辑器",
    customize: "使用拖放编辑自定义您的文凭模板",
    design: "设计",
    data: "数据",
    chooseTemplate: "选择模板",
    uploadTemplate: "上传模板",
    addElements: "添加元素",
    addTextField: "添加文本字段",
    addLogo: "添加标志/图像",
    addSignature: "添加签名",
    fieldProperties: "字段属性",
    content: "内容",
    fontSize: "字体大小",
    color: "颜色",
    fontFamily: "字体系列",
    fontWeight: "字体粗细",
    fields: "字段",
    records: "记录",
    loaded: "已加载",
    with: "带有",

    dataFormat: "数据格式示例",
    downloadExample: "下载正确格式的示例文件",
    downloadExampleCSV: "下载示例CSV",
    downloadExampleExcel: "下载示例Excel",
    currentFields: "当前字段：",
    generatePDF: "生成PDF",
    saveTemplate: "保存模板",
    dragToMove: "拖动移动",
    clickToSelect: "点击任何字段选择并拖动移动",
    addText: "添加文本字段",
    addImage: "添加标志/图像",
    editField: "字段属性",
  },
  ru: {
    diplomaEditor: "Редактор Дипломов",
    customize: "Настройте шаблон диплома с помощью редактирования перетаскиванием",
    design: "Дизайн",
    data: "Данные",
    chooseTemplate: "Выбрать Шаблон",
    uploadTemplate: "Загрузить Шаблон",
    addElements: "Добавить Элементы",
    addTextField: "Добавить Текстовое Поле",
    addLogo: "Добавить Логотип/Изображение",
    addSignature: "Добавить Подпись",
    fieldProperties: "Свойства Поля",
    content: "Содержание",
    fontSize: "Размер Шрифта",
    color: "Цвет",
    fontFamily: "Семейство Шрифтов",
    fontWeight: "Толщина Шрифта",
    fields: "Поля",
    records: "Записи",
    loaded: "загружено",
    with: "с",

    dataFormat: "Пример Формата Данных",
    downloadExample: "Скачать пример файла с правильным форматом",
    downloadExampleCSV: "Скачать Пример CSV",
    downloadExampleExcel: "Скачать Пример Excel",
    currentFields: "Текущие поля:",
    generatePDF: "Создать PDF",
    saveTemplate: "Сохранить Шаблон",
    dragToMove: "Перетащите для перемещения",
    clickToSelect: "Нажмите на любое поле для выбора и перетаскивания",
    addText: "Добавить Текстовое Поле",
    addImage: "Добавить Логотип/Изображение",
    editField: "Свойства Поля",
  },
  hi: {
    diplomaEditor: "डिप्लोमा संपादक",
    customize: "ड्रैग-एंड-ड्रॉप संपादन के साथ अपने डिप्लोमा टेम्प्लेट को कस्टमाइज़ करें",
    design: "डिज़ाइन",
    data: "डेटा",
    chooseTemplate: "टेम्प्लेट चुनें",
    uploadTemplate: "टेम्प्लेट अपलोड करें",
    addElements: "तत्व जोड़ें",
    addTextField: "टेक्स्ट फ़ील्ड जोड़ें",
    addLogo: "लोगो/छवि जोड़ें",
    addSignature: "हस्ताक्षर जोड़ें",
    fieldProperties: "फ़ील्ड गुण",
    content: "सामग्री",
    fontSize: "फ़ॉन्ट आकार",
    color: "रंग",
    fontFamily: "फ़ॉन्ट परिवार",
    fontWeight: "फ़ॉन्ट वजन",
    fields: "फ़ील्ड",
    records: "रिकॉर्ड",
    loaded: "लोड किए गए",
    with: "के साथ",

    dataFormat: "डेटा प्रारूप उदाहरण",
    downloadExample: "सही प्रारूप के साथ उदाहरण फ़ाइल डाउनलोड करें",
    downloadExampleCSV: "उदाहरण CSV डाउनलोड करें",
    downloadExampleExcel: "उदाहरण Excel डाउनलोड करें",
    currentFields: "वर्तमान फ़ील्ड:",
    generatePDF: "PDF बनाएं",
    saveTemplate: "टेम्प्लेट सहेजें",
    dragToMove: "स्थानांतरित करने के लिए खींचें",
    clickToSelect: "चुनने और खींचने के लिए किसी भी फ़ील्ड पर क्लिक करें",
    addText: "टेक्स्ट फ़ील्ड जोड़ें",
    addImage: "लोगो/छवि जोड़ें",
    editField: "फ़ील्ड गुण",
  },
  pt: {
    diplomaEditor: "Editor de Diplomas",
    customize: "Personalize seu modelo de diploma com edição de arrastar e soltar",
    design: "Design",
    data: "Dados",
    chooseTemplate: "Escolher Modelo",
    uploadTemplate: "Carregar Modelo",
    addElements: "Adicionar Elementos",
    addTextField: "Adicionar Campo de Texto",
    addLogo: "Adicionar Logo/Imagem",
    addSignature: "Adicionar Assinatura",
    fieldProperties: "Propriedades do Campo",
    content: "Conteúdo",
    fontSize: "Tamanho da Fonte",
    color: "Cor",
    fontFamily: "Família da Fonte",
    fontWeight: "Peso da Fonte",
    fields: "Campos",
    records: "Registros",
    loaded: "carregados",
    with: "com",

    dataFormat: "Exemplo de Formato de Dados",
    downloadExample: "Baixar um arquivo de exemplo com o formato correto",
    downloadExampleCSV: "Baixar Exemplo CSV",
    downloadExampleExcel: "Baixar Exemplo Excel",
    currentFields: "Campos atuais:",
    generatePDF: "Gerar PDF",
    saveTemplate: "Salvar Modelo",
    dragToMove: "Arrastar para mover",
    clickToSelect: "Clique em qualquer campo para selecionar e arrastar para mover",
    addText: "Adicionar Campo de Texto",
    addImage: "Adicionar Logo/Imagem",
    editField: "Propriedades do Campo",
  },
  de: {
    diplomaEditor: "Diplom-Editor",
    customize: "Passen Sie Ihre Diplomvorlage mit Drag-and-Drop-Bearbeitung an",
    design: "Design",
    data: "Daten",
    chooseTemplate: "Vorlage Wählen",
    uploadTemplate: "Vorlage Hochladen",
    addElements: "Elemente Hinzufügen",
    addTextField: "Textfeld Hinzufügen",
    addLogo: "Logo/Bild Hinzufügen",
    addSignature: "Unterschrift Hinzufügen",
    fieldProperties: "Feldeigenschaften",
    content: "Inhalt",
    fontSize: "Schriftgröße",
    color: "Farbe",
    fontFamily: "Schriftfamilie",
    fontWeight: "Schriftstärke",
    fields: "Felder",
    records: "Einträge",
    loaded: "geladen",
    with: "mit",

    dataFormat: "Datenformat-Beispiel",
    downloadExample: "Beispieldatei mit dem richtigen Format herunterladen",
    downloadExampleCSV: "Beispiel CSV Herunterladen",
    downloadExampleExcel: "Beispiel Excel Herunterladen",
    currentFields: "Aktuelle Felder:",
    generatePDF: "PDF Erstellen",
    saveTemplate: "Vorlage Speichern",
    dragToMove: "Zum Verschieben ziehen",
    clickToSelect: "Klicken Sie auf ein beliebiges Feld zum Auswählen und Ziehen zum Verschieben",
    addText: "Textfeld Hinzufügen",
    addImage: "Logo/Bild Hinzufügen",
    editField: "Feldeigenschaften",
  },
  id: {
    diplomaEditor: "Editor Diploma",
    customize: "Sesuaikan template diploma Anda dengan pengeditan drag-and-drop",
    design: "Desain",
    data: "Data",
    chooseTemplate: "Pilih Template",
    uploadTemplate: "Unggah Template",
    addElements: "Tambah Elemen",
    addTextField: "Tambah Field Teks",
    addLogo: "Tambah Logo/Gambar",
    addSignature: "Tambah Tanda Tangan",
    fieldProperties: "Properti Field",
    content: "Konten",
    fontSize: "Ukuran Font",
    color: "Warna",
    fontFamily: "Keluarga Font",
    fontWeight: "Ketebalan Font",
    fields: "Field",
    records: "rekaman",
    loaded: "dimuat",
    with: "dengan",

    dataFormat: "Contoh Format Data",
    downloadExample: "Unduh file contoh dengan format yang benar",
    downloadExampleCSV: "Unduh Contoh CSV",
    downloadExampleExcel: "Unduh Contoh Excel",
    currentFields: "Field saat ini:",
    generatePDF: "Buat PDF",
    saveTemplate: "Simpan Template",
    dragToMove: "Seret untuk memindahkan",
    clickToSelect: "Klik field mana pun untuk memilih dan seret untuk memindahkan",
    addText: "Tambah Field Teks",
    addImage: "Tambah Logo/Gambar",
    editField: "Properti Field",
  },
  tr: {
    diplomaEditor: "Diploma Editörü",
    customize: "Sürükle ve bırak düzenleme ile diploma şablonunuzu özelleştirin",
    design: "Tasarım",
    data: "Veri",
    chooseTemplate: "Şablon Seç",
    uploadTemplate: "Şablon Yükle",
    addElements: "Öğe Ekle",
    addTextField: "Metin Alanı Ekle",
    addLogo: "Logo/Resim Ekle",
    addSignature: "İmza Ekle",
    fieldProperties: "Alan Özellikleri",
    content: "İçerik",
    fontSize: "Font Boyutu",
    color: "Renk",
    fontFamily: "Font Ailesi",
    fontWeight: "Font Kalınlığı",
    fields: "Alanlar",
    records: "kayıt",
    loaded: "yüklendi",
    with: "ile",

    dataFormat: "Veri Formatı Örneği",
    downloadExample: "Doğru formatta örnek dosya indir",
    downloadExampleCSV: "Örnek CSV İndir",
    downloadExampleExcel: "Örnek Excel İndir",
    currentFields: "Mevcut alanlar:",
    generatePDF: "PDF Oluştur",
    saveTemplate: "Şablonu Kaydet",
    dragToMove: "Taşımak için sürükle",
    clickToSelect: "Seçmek için herhangi bir alana tıklayın ve sürükleyin taşımak için",
    addText: "Metin Alanı Ekle",
    addImage: "Logo/Resim Ekle",
    editField: "Alan Özellikleri",
  },
}

const DiplomaEditor = ({ language = "en" }: DiplomaEditorProps) => {
  const [fields, setFields] = useState<DiplomaField[]>([
    {
      id: "1",
      type: "text",
      title: "Name", // Added title field for CSV mapping
      content: "John Doe",
      x: 50,
      y: 40,
      width: 200,
      height: 40,
      fontSize: 24,
      fontFamily: "serif",
      color: "#000000",
      fontWeight: "normal",
    },
    {
      id: "2",
      type: "text",
      title: "Degree", // Added title field for CSV mapping
      content: "Bachelor of Science",
      x: 50,
      y: 55,
      width: 300,
      height: 30,
      fontSize: 18,
      fontFamily: "serif",
      color: "#000000",
      fontWeight: "normal",
    },
  ])

  const [selectedTemplate, setSelectedTemplate] = useState<string>("/professional-diploma-template.png")
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([
    "/professional-diploma-template.png",
    "/classic-diploma-template.png",
    "/modern-clean-certificate.png",
    "/elegant-diploma-template.png",
  ])
  const [bulkData, setBulkData] = useState<{ headers: string[]; records: any[] } | null>(null)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const t = translations[language]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedField || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newX = ((e.clientX - dragOffset.x - canvasRect.left) / canvasRect.width) * 100
      const newY = ((e.clientY - dragOffset.y - canvasRect.top) / canvasRect.height) * 100

      const constrainedX = Math.max(0, Math.min(95, newX))
      const constrainedY = Math.max(0, Math.min(95, newY))

      updateField(selectedField, { x: constrainedX, y: constrainedY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, selectedField, dragOffset])

  const addField = (type: "text" | "image" | "signature") => {
    const newField: DiplomaField = {
      id: Date.now().toString(),
      type,
      title: type === "text" ? `Field ${fields.length + 1}` : type, // Set default title
      content: type === "text" ? "Sample Text" : "",
      x: 20,
      y: 20,
      width: type === "text" ? 200 : 100,
      height: type === "text" ? 40 : 100,
      fontSize: 16,
      fontFamily: "serif",
      color: "#000000",
      fontWeight: "normal",
    }
    setFields([...fields, newField])
    setSelectedField(newField.id)
  }

  const updateField = (fieldId: string, updates: Partial<DiplomaField>) => {
    setFields(fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)))
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter((field) => field.id !== fieldId))
    if (selectedField === fieldId) {
      setSelectedField(null)
    }
  }

  const handleTemplateUpload = (file: any) => {
    if (file && file.url) {
      const newTemplate = file.url
      setAvailableTemplates((prev) => [...prev, newTemplate])
      setSelectedTemplate(newTemplate)
      console.log(" Template uploaded and selected:", newTemplate)
      console.log(" Available templates:", [...availableTemplates, newTemplate])
    }
  }

  const handleImageUpload = (file: any) => {
    console.log("Image uploaded:", file)
  }

  const handleDataProcessed = (data: { headers: string[]; records: any[] }) => {
    setBulkData(data)
    const updatedFields = fields.map((field) => {
      if (field.type === "text" && data.headers.includes(field.title)) {
        return field
      }
      return field
    })
    setFields(updatedFields)
    console.log("Data processed and set:", data)
  }

  const selectedFieldData = fields.find((f) => f.id === selectedField)

  const sampleSingleData = {
    Name: "John Doe",
    Degree: "Bachelor of Computer Science",
    Date: "May 15, 2024",
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, fieldId: string) => {
      e.preventDefault()
      e.stopPropagation()

      const field = fields.find((f) => f.id === fieldId)
      if (!field || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const fieldElement = e.currentTarget as HTMLElement
      const fieldRect = fieldElement.getBoundingClientRect()

      setIsDragging(true)
      setSelectedField(fieldId)
      setDragOffset({
        x: e.clientX - fieldRect.left,
        y: e.clientY - fieldRect.top,
      })
    },
    [fields],
  )

  const generateExampleCSV = () => {
    const headers = fields.filter((f) => f.type === "text").map((f) => f.title)
    const exampleData = [headers, headers.map(() => "Sample Data"), headers.map(() => "Example Entry")]

    const csvContent = exampleData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diploma-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateExampleExcel = () => {
    const headers = fields.filter((f) => f.type === "text").map((f) => f.title)
    const exampleData = [headers, headers.map(() => "Sample Data"), headers.map(() => "Example Entry")]

    // Simple Excel-like format (TSV)
    const excelContent = exampleData.map((row) => row.join("\t")).join("\n")
    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diploma-template.xlsx"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header with Generate/Save buttons */}
      <div className="sticky top-16 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">{t.diplomaEditor}</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" className="h-8 px-3 text-xs" onClick={() => setShowPDFPreview(true)}>
              <FileText className="h-3 w-3 mr-1" />
              {t.generatePDF}
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs bg-transparent">
              <Save className="h-3 w-3 mr-1" />
              {t.saveTemplate}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div
          className="w-80 border-r border-border bg-muted/30 overflow-y-auto"
          style={{ height: "calc(100vh - 128px)" }}
        >
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="design" className="text-xs">
                {t.design}
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs">
                {t.data}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="p-4 space-y-4">
              {/* Canvas Dimensions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Canvas Size</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Width</label>
                      <Input
                        type="number"
                        value={canvasDimensions.width}
                        onChange={(e) =>
                          setCanvasDimensions((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 800 }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Height</label>
                      <Input
                        type="number"
                        value={canvasDimensions.height}
                        onChange={(e) =>
                          setCanvasDimensions((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 600 }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Elements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t.addElements}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => addField("text")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <Type className="h-3 w-3 mr-2" />
                    {t.addTextField}
                  </Button>
                  <Button
                    onClick={() => addField("image")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <ImageIcon className="h-3 w-3 mr-2" />
                    {t.addLogo}
                  </Button>
                  <Button
                    onClick={() => addField("signature")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <PenTool className="h-3 w-3 mr-2" />
                    {t.addSignature}
                  </Button>
                </CardContent>
              </Card>

              {/* Field Management */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {t.fields} ({fields.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedField === field.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                        }`}
                      onClick={() => setSelectedField(field.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {field.type === "text" && <Type className="h-3 w-3" />}
                          {field.type === "image" && <ImageIcon className="h-3 w-3" />}
                          {field.type === "signature" && <PenTool className="h-3 w-3" />}
                          <span className="text-xs font-medium">{field.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteField(field.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {field.type === "text" && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{field.content}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Field Properties */}
              {selectedField && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t.fieldProperties}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const field = fields.find((f) => f.id === selectedField)
                      if (!field) return null

                      return (
                        <>
                          <div>
                            <label className="text-xs text-muted-foreground">Title</label>
                            <Input
                              value={field.title}
                              onChange={(e) => updateField(selectedField, { title: e.target.value })}
                              className="h-8 text-xs"
                              placeholder="Field title for CSV mapping"
                            />
                          </div>
                          {field.type === "text" && (
                            <>
                              <div>
                                <label className="text-xs text-muted-foreground">{t.content}</label>
                                <Input
                                  value={field.content}
                                  onChange={(e) => updateField(selectedField, { content: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-muted-foreground">{t.fontSize}</label>
                                  <Input
                                    type="number"
                                    value={field.fontSize}
                                    onChange={(e) =>
                                      updateField(selectedField, { fontSize: Number.parseInt(e.target.value) || 16 })
                                    }
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">{t.color}</label>
                                  <Input
                                    type="color"
                                    value={field.color}
                                    onChange={(e) => updateField(selectedField, { color: e.target.value })}
                                    className="h-8 p-1"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="data" className="p-4 space-y-4">
              {/* Example File Downloads */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Download Template</CardTitle>
                  <CardDescription className="text-xs">{t.downloadExample}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={generateExampleCSV}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8 bg-transparent"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    {t.downloadExampleCSV}
                  </Button>
                  <Button
                    onClick={generateExampleExcel}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8 bg-transparent"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    {t.downloadExampleExcel}
                  </Button>
                </CardContent>
              </Card>

              <CSVProcessor onDataProcessed={handleDataProcessed} />

              {/* Show bulk data status */}
              {bulkData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-600">{t.currentFields}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {bulkData.records.length} {t.records} {t.loaded} {t.with} {bulkData.headers.join(", ")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex">
          <div className="flex-1 p-4">
            <div className="sticky top-32 space-y-4">
              <div
                ref={canvasRef}
                className="relative bg-white border-2 border-dashed border-gray-300 mx-auto shadow-lg"
                style={{
                  width: `${Math.min(canvasDimensions.width, 800)}px`, // Constrain max width
                  height: `${Math.min(canvasDimensions.height, 600)}px`, // Constrain max height
                  backgroundImage: `url(${selectedTemplate})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className={`absolute transition-all group ${selectedField === field.id
                        ? "border-2 border-primary border-dashed"
                        : "border-2 border-transparent hover:border-primary/50"
                      } ${isDragging && selectedField === field.id ? "cursor-grabbing" : "cursor-grab"}`}
                    style={{
                      left: `${(field.x / 100) * Math.min(canvasDimensions.width, 800)}px`,
                      top: `${(field.y / 100) * Math.min(canvasDimensions.height, 600)}px`,
                      width: `${field.width}px`,
                      height: `${field.height}px`,
                    }}
                    onClick={() => setSelectedField(field.id)}
                    onMouseDown={(e) => handleMouseDown(e, field.id)}
                  >
                    {field.type === "text" && (
                      <div
                        className="w-full h-full flex items-center justify-center text-center relative"
                        style={{
                          fontSize: `${field.fontSize}px`,
                          fontFamily: field.fontFamily,
                          color: field.color,
                          fontWeight: field.fontWeight,
                        }}
                      >
                        {field.content}
                        {selectedField === field.id && (
                          <div className="absolute -top-6 left-0 bg-white border border-border rounded px-2 py-1 shadow-sm flex items-center gap-1 text-xs z-10">
                            <Input
                              type="number"
                              value={field.fontSize}
                              onChange={(e) =>
                                updateField(field.id, { fontSize: Number.parseInt(e.target.value) || 16 })
                              }
                              className="w-10 h-4 text-xs p-1"
                              min="8"
                              max="72"
                            />
                            <select
                              value={field.fontFamily}
                              onChange={(e) => updateField(field.id, { fontFamily: e.target.value })}
                              className="h-4 text-xs border border-border rounded px-1"
                            >
                              <option value="serif">Serif</option>
                              <option value="sans-serif">Sans</option>
                              <option value="monospace">Mono</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                    {field.type === "image" && (
                      <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        {field.content ? (
                          <img
                            src={field.content || "/placeholder.svg"}
                            alt="Uploaded"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <FileUpload
                              type="image"
                              onUploadComplete={(file) => updateField(field.id, { content: file.url })}
                              onUploadError={(error) => console.error("Image upload error:", error)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Templates */}
          <div
            className="w-80 border-l border-border bg-muted/30 overflow-y-auto"
            style={{ height: "calc(100vh - 128px)" }}
          >
            <div className="p-4 space-y-4">
              {/* Template Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t.chooseTemplate}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {availableTemplates.map((template, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-colors ${selectedTemplate === template ? "border-primary" : "border-border hover:border-primary/50"
                          }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <img
                          src={template || "/placeholder.svg"}
                          alt={`Template ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                        {selectedTemplate === template && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Template Upload */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t.uploadTemplate}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    type="template"
                    onUploadComplete={handleTemplateUpload}
                    onUploadError={(error) => console.error("Template upload error:", error)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto relative w-full">
            <Button
              onClick={() => setShowPDFPreview(false)}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="p-6">
              <PDFGenerator
                template={selectedTemplate}
                fields={fields}
                bulkData={bulkData}
                singleData={fields.reduce(
                  (acc, field) => {
                    if (field.type === "text") {
                      acc[field.title] = field.content
                    }
                    return acc
                  },
                  {} as Record<string, string>,
                )}
                canvasDimensions={canvasDimensions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { DiplomaEditor }
export default DiplomaEditor
