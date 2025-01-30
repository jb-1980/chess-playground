import {
  BulkWriteOptions,
  Collection,
  CollectionOptions,
  CreateIndexesOptions,
  DeleteOptions,
  Document,
  Filter,
  FindOptions,
  IndexDescription,
  InsertOneOptions,
  ObjectId,
  OptionalId,
  OptionalUnlessRequiredId,
  ReplaceOptions,
  UpdateFilter,
  UpdateOptions,
  WithoutId,
  MongoError,
} from "mongodb"
import { mongoDB } from "./connection"

export type TDocument<TSchema> = OptionalId<
  TSchema & {
    createdAt: Date
    updatedAt: Date
  }
>

export enum CollectionErrors {
  DOCUMENT_FAILED_VALIDATION = "DOCUMENT_FAILED_VALIDATION",
}

export class MongoCollection<TSchema extends Document> {
  private _collection: Collection<TDocument<TSchema>>
  private _name: string

  public initialized = false

  constructor(name: string, options?: CollectionOptions) {
    this._name = name
    this._collection = mongoDB.collection<TDocument<TSchema>>(name, options)
  }

  public get name() {
    return this._name
  }

  get rawCollection() {
    return this._collection
  }

  public async initialize(args: {
    indexes?: {
      indexSpecs: IndexDescription[]
      options?: CreateIndexesOptions
    }
    // The typing on this is weak, but it is what mongodb expects. Hoping that
    // there will be a Validator type in the future.
    validator?: {
      jsonSchema: Document
      validationLevel?: "strict" | "moderate" | "off"
      validationAction?: "error" | "warn"
    }
  }) {
    const { indexes, validator } = args
    if (indexes && indexes.indexSpecs.length > 0) {
      await this._collection.createIndexes(indexes.indexSpecs, indexes.options)
    }

    if (validator) {
      await mongoDB.command({
        collMod: this._name,
        validator: validator.jsonSchema,
        validationLevel: validator.validationLevel ?? "strict",
        validationAction: validator.validationAction ?? "error",
      })
    }
    this.initialized = true
  }

  public find(filter: Filter<TDocument<TSchema>>, options?: FindOptions) {
    return this._collection.find(filter, options)
  }

  public async findOne(
    filter: Filter<TDocument<TSchema>>,
    options?: FindOptions,
  ) {
    return await this._collection.findOne(filter, options)
  }

  public async insertOne(doc: OptionalId<TSchema>, options?: InsertOneOptions) {
    const newDoc = {
      _id: new ObjectId().toHexString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...doc,
    } as unknown as OptionalUnlessRequiredId<TDocument<TSchema>>

    try {
      return await this._collection.insertOne(newDoc, options)
    } catch (error: unknown) {
      if (error instanceof MongoError && error.code === 121) {
        console.dir(error, { depth: null, colors: true })
        throw new Error(CollectionErrors.DOCUMENT_FAILED_VALIDATION)
      }
      throw error
    }
  }

  public async insertMany(
    docs: ReadonlyArray<OptionalUnlessRequiredId<TDocument<TSchema>>>,
    options?: BulkWriteOptions,
  ) {
    try {
      return await this._collection.insertMany(
        docs.map((doc) => ({
          _id: new ObjectId().toHexString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...doc,
        })),
        options,
      )
    } catch (error: unknown) {
      if (error instanceof MongoError && error.code === 121) {
        console.dir(error, { depth: null, colors: true })
        throw new Error(CollectionErrors.DOCUMENT_FAILED_VALIDATION)
      }
      throw error
    }
  }

  public async updateOne(
    filter: Filter<TDocument<TSchema>>,
    update: UpdateFilter<TDocument<TSchema>> | Document[],
    options?: UpdateOptions,
  ) {
    let _update: UpdateFilter<TDocument<TSchema>> | Document[]
    if (Array.isArray(update)) {
      _update = update
    } else if (update.$set) {
      _update = update
      if (options?.upsert && update.$setOnInsert) {
        _update.$setOnInsert = {
          ...(update.$setOnInsert && { ...update.$setOnInsert }),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      } else {
        _update.$set = {
          ...update.$set,
          updatedAt: new Date(),
        }
      }
    } else {
      _update = update
    }
    try {
      return await this._collection.updateOne(filter, _update, options)
    } catch (error: unknown) {
      if (error instanceof MongoError && error.code === 121) {
        console.dir(error, { depth: null, colors: true })
        throw new Error(CollectionErrors.DOCUMENT_FAILED_VALIDATION)
      }
      throw error
    }
  }

  public async replaceOne(
    /** The filter used to select the document to replace */
    filter: Filter<TDocument<TSchema>>,
    /** The Document that replaces the matching document */
    replacement: WithoutId<TDocument<TSchema>>,
    /** Optional settings for the command */
    options?: ReplaceOptions,
  ) {
    try {
      return await this._collection.replaceOne(
        filter,
        {
          createdAt: new Date(),
          updatedAt: new Date(),
          ...replacement,
        },
        options,
      )
    } catch (error: unknown) {
      if (error instanceof MongoError && error.code === 121) {
        console.dir(error, { depth: null, colors: true })
        throw new Error(CollectionErrors.DOCUMENT_FAILED_VALIDATION)
      }
      throw error
    }
  }

  public async updateMany(
    /** The filter used to select the document to update */
    filter: Filter<TDocument<TSchema>>,
    /** The modifications to apply */
    update: UpdateFilter<TDocument<TSchema>> | Document[],
    /** Optional settings for the command */
    options?: UpdateOptions,
  ) {
    let _update: UpdateFilter<TDocument<TSchema>> | Document[]
    if (Array.isArray(update)) {
      _update = update
    } else if (update.$set) {
      _update = update
      if (options?.upsert && update.$setOnInsert) {
        _update.$setOnInsert = {
          ...(update.$setOnInsert && { ...update.$setOnInsert }),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      } else {
        _update.$set = {
          ...update.$set,
          updatedAt: new Date(),
        }
      }
    } else {
      _update = update
    }
    try {
      return await this._collection.updateMany(filter, _update, options)
    } catch (error: unknown) {
      if (error instanceof MongoError && error.code === 121) {
        console.dir(error, { depth: null, colors: true })
        throw new Error(CollectionErrors.DOCUMENT_FAILED_VALIDATION)
      }
      throw error
    }
  }

  public async deleteOne(
    /** The filter used to select the documents to remove */
    filter?: Filter<TDocument<TSchema>>,
    /** Optional settings for the command */
    options?: DeleteOptions,
  ) {
    return await this._collection.deleteOne(filter, options)
  }

  public async deleteMany(
    /** The filter used to select the documents to remove */
    filter?: Filter<TDocument<TSchema>>,
    /** Optional settings for the command */
    options?: DeleteOptions,
  ) {
    return await this._collection.deleteOne(filter, options)
  }
}
